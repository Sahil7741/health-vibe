import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';  // For reset password token generation
import nodemailer from 'nodemailer';  // For sending reset password emails
import { body, validationResult } from 'express-validator';  // Import express-validator

// Controller for handling user-related operations

// **Register a new user**
export const registerUser = [
  // Validation rules
  body('firstName').notEmpty().withMessage('First name is required.'),
  body('lastName').notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Invalid email format.'),
  body('phone').notEmpty().withMessage('Phone number is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  
  async (req, res) => {
    const errors = validationResult(req);  // Validate the request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });  // Return validation errors
    }
  
    try {
      const { firstName, lastName, email, phone, password } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send({ message: 'User already exists with this email.' });
      }
  
      const user = new User({ firstName, lastName, email, phone, password });
      await user.save();
  
      const token = await user.generateAuthToken();
      res.status(201).send({ user, token });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
];

export const loginUser = [

  // Validation rules
  body('emailOrPhone').notEmpty().withMessage('Email or phone number is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  body('twoFactorToken').optional().notEmpty().withMessage('Two-factor authentication token is required if 2FA is enabled.'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if there's already a valid token in the cookies
      const token = req.cookies.authToken;
      if (token) {
        try {
          // Verify the existing token
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          // If token is valid, the user is already logged in
          return res.status(200).send({ message: 'User is already logged in.' });
        } catch (err) {
          // If the token is invalid, continue with login
          console.log('Invalid token, proceeding with login.');
        }
      }

      // No valid token, proceed with login
      const { emailOrPhone, password, twoFactorToken } = req.body;
      const user = await User.findByCredentials(emailOrPhone, password);

      // Handle two-factor authentication if enabled
      if (user.twoFactorEnabled) {
        if (!twoFactorToken) {
          return res.status(400).send({ message: 'Two-factor authentication token is required.' });
        }

        const is2FATokenValid = user.verifyTwoFactorAuth(twoFactorToken);
        if (!is2FATokenValid) {
          return res.status(401).send({ message: 'Invalid two-factor authentication token.' });
        }
      }

      // Generate a new auth token
      const newToken = await user.generateAuthToken();

      // Set the new token in an HTTP-only cookie
      res.cookie('authToken', newToken, {
        httpOnly: true,     // Prevents client-side access (secure against XSS)
        secure: process.env.NODE_ENV === 'production',  // Ensures cookies are only sent over HTTPS
        sameSite: 'strict', // Helps protect against CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expires in 7 days
      });

      // Respond with user info (without sending token in body)
      res.send({ user });

    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }
];


// **Enable Two-Factor Authentication (2FA)**
export const enableTwoFactorAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).send({ message: 'Two-factor authentication is already enabled.' });
    }

    // Set up 2FA for the user and return the secret and QR code
    const { secret, qrCode } = await user.setupTwoFactorAuth();
    res.send({ message: 'Two-factor authentication setup complete.', secret, qrCode });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// **Disable Two-Factor Authentication (2FA)**
export const disableTwoFactorAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.twoFactorEnabled) {
      return res.status(400).send({ message: 'Two-factor authentication is not enabled.' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.send({ message: 'Two-factor authentication has been disabled.' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// **Forgot Password (Send reset password email)**
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: 'User not found with this email.' });
    }

    // Generate reset password token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email with reset link
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested a password reset for your account. Please click on the following link, or paste it into your browser to complete the process:\n\n${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);
    res.send({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// **Reset Password (Handle password reset)**
export const resetPassword = [
  // Validation rules
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  
  async (req, res) => {
    const { token } = req.params;
    const errors = validationResult(req);  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });  
    }
  
    try {
      const { password } = req.body;
  
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).send({ message: 'Invalid or expired token.' });
      }
  
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
  
      res.send({ message: 'Password has been reset successfully.' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
];

// **Logout the user**
export const logoutUser = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(tokenObj => tokenObj.token !== req.token);
    await req.user.save();

    res.send({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// **Get User Profile**
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};























































// // Required Models Imported
// const User = require("../models/userModel");
// const Product = require("../models/productModel");
// const avatarUrl = require("./avatar");

// // Asynchronous function to get status if User is Logged In
// const status = async (req, res) => {
//   try {
//     // If user is present then continue else send resopnse with 404 status code
//     if (req.cookies.userId) {
//       // Searching User By UserId
//       const user = await User.findById(req.cookies.userId);

//       // Creating data for Response
//       const data = {
//         status: true,
//         avatarUrl: user.avatarUrl,
//       };
//       let result = JSON.stringify(data);
//       res.setHeader("Content-Type", "application/json");
//       res.status(200).send(result);
//     } else {
//       const data = {
//         status: false,
//         avatarUrl: null,
//       };
//       let result = JSON.stringify(data);
//       res.setHeader("Content-Type", "application/json");
//       res.status(404).send(result);
//     }
//   } catch (err) {
//     // In Case of Error in Handling Request
//     console.log(err);
//     res.status(500).send("Internal Server Error");
//   }
// };

// // Asynchronous function to SignUp User
// const signup = async (req, res) => {
//   try {
//     // Random Number Generating Function
//     function getRandomInt(min, max) {
//       min = Math.ceil(min);
//       max = Math.floor(max);
//       return Math.floor(Math.random() * (max - min + 1)) + min;
//     }

//     const randomIndex = getRandomInt(0, avatarUrl.length - 1);
//     const randomLink = avatarUrl[randomIndex];

//     console.log(req.body);

//     // Creating User Object
//     const user = new User(req.body);
//     user.avatarUrl = randomLink;
//     user.addrs1 = "Address 1";
//     user.addrs2 = "Address 2";

//     // Waiting for User to get Saved in Database
//     await user.save();
//     res.status(201).send("Successfully Signed Up");
//   } catch (err) {
//     // In Case of Error in Handling Request
//     console.log(err);
//     res.status(500).send("Internal Server Error");
//   }
// };

// // Asynchronous function to Login User
// const login = async (req, res) => {
//   try {
//     // Extracting Data from Request
//     const { usremail, usrpassword } = req.body;

//     // Searching User in Database using Email
//     const user = await User.findOne({ email: usremail });

//     if (user === null) {
//       res.status(401).json({ message: "Invalid Username or Password" });
//       return;
//     }
//     // Checking if Password are Same
//     const passwordmatch = user.password == usrpassword;

//     // If Password Matches then Set Cookies else Send Response with 401 status code
//     if (passwordmatch) {
//       // If Cookies are already Present then don't Set Cookies else Set Cookies
//       if (req.cookies.userId) {
//         res.status(200).json({ message: "Already Logged In" });
//       } else {
//         res.cookie("userId", user._id, {
//           httpOnly: false,
//           sameSite: "None",
//           secure: true,
//         });
//         res.status(200).json({ message: "Successfully Logged In" });
//       }
//     } else {
//       res.status(401).json({ message: "Invalid Username or Password" });
//     }
//   } catch (err) {
//     // In Case of Error in Handling Request
//     console.log(err);
//     res.status(500).send("Internal Server Error");
//   }
// };

// // Asynchronous function to Logout User
// const logout = async (req, res) => {
//   try {
//     // If user is present then Clear Cookies else send resopnse with 400 Status Code
//     if (req.cookies.userId) {
//       res.clearCookie("userId", {
//         httpOnly: false,
//         sameSite: "None",
//         secure: true,
//       });
//       res.status(200).send("Successfully Logged Out");
//     } else {
//       res.status(400).json({ message: "User Not logged In" });
//     }
//   } catch (err) {
//     // In Case of Error in Handling Request
//     console.log(err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // // Asynchronous function to Add to Cart Only
// // const addToCartOnly = async (req, res) => {
// //   // Extracting Data From Request
// //   const productId = req.params.productId;
// //   const userId = req.cookies.userId;

// //   try {
// //     // Searching User in Database using userId
// //     const user = await User.findById(userId);

// //     // If User not found then Send Response with 404  Status Code
// //     if (!user) {
// //       return res.status(404).send("User not found. Please Login");
// //     }

// //     // Checking If Product Exist in  User Cart
// //     const existCartItem = user.cart.find((item) =>
// //       item.itemId.equals(productId)
// //     );

// //     // If Product Exist in Cart then Quantity + 1 else Push Product in User Cart Array
// //     if (existCartItem) {
// //       existCartItem.quantity += 1;
// //     } else {
// //       user.cart.push({ itemId: productId, quantity: 1, size: 8 });
// //     }

// //     // Waiting to get Saved in Database
// //     await user.save();
// //     res.status(201).send("Product added to cart successfully");
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.error(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Add to Cart Only
// // const addToCart = async (req, res) => {
// //   // Extracting Data From Request
// //   const productId = req.params.productId;
// //   const userId = req.cookies.userId;
// //   const { quantity, size } = req.body;

// //   try {
// //     // Searching User in Database using userId
// //     const user = await User.findById(userId);

// //     // If User not found then Send Response with 404  Status Code
// //     if (!user) {
// //       return res.status(404).send("User not found. Please Login");
// //     }

// //     // Checking If Product Exist in  User Cart
// //     const existCartItem = user.cart.find((item) =>
// //       item.itemId.equals(productId)
// //     );

// //     // If Product Exist in Cart then update Quantity else Push Product in User Cart Array
// //     if (existCartItem) {
// //       existCartItem.quantity = quantity;
// //       existCartItem.size = size;
// //     } else {
// //       user.cart.push({ itemId: productId, quantity: quantity, size: size });
// //     }

// //     // Waiting to get Saved in Database
// //     await user.save();
// //     res.status(201).send("Product added to cart successfully");
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.error(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Get User Cart
// // const getCart = async (req, res) => {
// //   try {
// //     // If User is Present then Continue else Send Resopnse with 400 Status Code
// //     if (req.cookies.userId) {
// //       const id = req.cookies.userId;

// //       // Searching User in Database and Extracting its Cart
// //       const result = await User.findById(id);
// //       const data = result.cart;
// //       res.status(200).send(data);
// //     } else {
// //       res.status(400).send("Please Login");
// //     }
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.log(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Remove Product from User Cart
// // const removeFromCart = async (req, res) => {
// //   // Extracting Data from Request
// //   const productId = req.params.productId;
// //   const userId = req.cookies.userId;

// //   try {
// //     // Searching User in Database
// //     const user = await User.findById(userId);

// //     // If User not found then Send Response with 404  Status Code
// //     if (!user) {
// //       return res.status(404).send("User not found");
// //     }

// //     // Searching for Index
// //     const existCartItemIndex = user.cart.findIndex((item) =>
// //       item.itemId.equals(productId)
// //     );

// //     // If Product Exist in Cart then Remove it else Send Response with 404 Status Code
// //     if (existCartItemIndex !== -1) {
// //       user.cart.splice(existCartItemIndex, 1);
// //     } else {
// //       return res.status(404).send("Product not found in the cart");
// //     }

// //     // Waiting to get Saved in Database
// //     await user.save();
// //     res.status(200).send("Product removed from cart successfully");
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.error(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Get Total Amount To Pay
// // const totalamount = async (req, res) => {
// //   try {
// //     // If User is Present then Continue else Send Resopnse with 400 Status Code
// //     if (req.cookies.userId) {
// //       // Extracting Data from Request
// //       const id = req.cookies.userId;
// //       const user = await User.findById(id);
// //       const cart = user.cart;

// //       // Calculating Total Amount
// //       let currentid;
// //       let currentamount;
// //       let tamount = 0;
// //       for (let i = 0; i < cart.length; i++) {
// //         currentid = cart[i].itemId;
// //         const currentproduct = await Product.findById(currentid);
// //         currentamount = currentproduct.price;
// //         tamount = tamount + cart[i].quantity * currentamount;
// //       }
// //       res.status(200).send(`${tamount}`);
// //     } else {
// //       res.status(400).send(tamount);
// //     }
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.log(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Add Product to Wishlist
// // const addToWishList = async (req, res) => {
// //   // Extracting Data from Request
// //   const productId = req.params.productId;
// //   const userId = req.cookies.userId;
// //   try {
// //     // Searching User By UserId
// //     const user = await User.findById(userId);

// //     // If User not found then Send Response with 404  Status Code
// //     if (!user) {
// //       return res.status(404).send("User not found. Please Login");
// //     }

// //     // Checking If Product Exist in User Wishlist
// //     const itemExistIndex = user.wishList.findIndex((item) =>
// //       item.itemId.equals(productId)
// //     );

// //     // If Product Exist in Wishlist then remove it else Push Product in Wishlist Array
// //     if (itemExistIndex !== -1) {
// //       user.wishList.splice(itemExistIndex, 1);
// //       operationMessage = "Product removed from wishlist successfully";
// //     } else {
// //       user.wishList.push({ itemId: productId, quantity: 1, size: 8 });
// //     }

// //     // Waiting to get Saved in Database
// //     await user.save();
// //     res.status(200).send("Product added to wishlist successfully");
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.error(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Get Wishlist
// // const getWishList = async (req, res) => {
// //   try {
// //     // If User is Present then Continue else Send Resopnse with 400 Status Code
// //     if (req.cookies.userId) {
// //       const id = req.cookies.userId;
// //       const user = await User.findById(id);
// //       const data = user.wishList;
// //       res.status(200).send(data);
// //     } else {
// //       res.status(400).send("Please Login");
// //     }
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.log(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Remove Product from Wishlist
// // const removeFromWishList = async (req, res) => {
// //   // Extracting Data from Request
// //   const productId = req.params.productId;
// //   const userId = req.cookies.userId;

// //   try {
// //     // Searching User in Database
// //     const user = await User.findById(userId);

// //     // If User not found then Send Response with 404  Status Code
// //     if (!user) {
// //       return res.status(404).send("User not found");
// //     }

// //     // Searching for Index
// //     const existItemIndex = user.wishList.findIndex((item) =>
// //       item.itemId.equals(productId)
// //     );

// //     // If Product Exist in Wishlist then Remove it else Send Response with 404 Status Code
// //     if (existItemIndex !== -1) {
// //       user.wishList.splice(existItemIndex, 1);
// //     } else {
// //       return res.status(404).send("Product not found in the Wishlist");
// //     }

// //     // Waiting to get Saved in Database
// //     await user.save();
// //     res.status(200).send("Product removed from Wishlist successfully");
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.error(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to View Profile of User
// // const viewprofile = async (req, res) => {
// //   try {
// //     // If User is Present then Continue else Send Resopnse with 400 Status Code
// //     if (req.cookies.userId) {
// //       // Searching User in Database
// //       const user = await User.findById(req.cookies.userId);
// //       res.status(200).send(user);
// //     } else {
// //       res.status(400).json({ message: "Please Login..." });
// //     }
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.log(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Delete User Account
// // const deleteUser = async (req, res) => {
// //   // Extracting Data from Request
// //   const userId = req.cookies.userId;

// //   try {
// //     // If User is Present then Continue else Send Resopnse with 400 Status Code
// //     if (req.cookies.userId) {
// //       const deletedUser = await User.findOneAndDelete({ _id: userId });

// //       // If User is Deleted then Clear Cookies
// //       if (deletedUser) {
// //         res.clearCookie("userId", {
// //           httpOnly: false,
// //           sameSite: "None",
// //           secure: true,
// //         });
// //         res.status(200).send("Account Deleted !");
// //       } else {
// //         res.status(400).send("User not found");
// //       }
// //     } else {
// //       res.status(400).send("Please Login First...");
// //     }
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.log(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Update User Details
// // const update = async (req, res) => {
// //   // Extracting  Data from request
// //   const userId = req.cookies.userId;
// //   const { firstName, lastName, addrs1, addrs2, password } = req.body;

// //   try {
// //     // If User is Present then Continue else Send Resopnse with 400 Status Code
// //     if (req.cookies.userId) {
// //       // Searching User in Database
// //       const user = await User.findById(userId);
// //       // If User is Found then Update Details else Responde with 404 Status Code
// //       if (user) {
// //         user.firstName = firstName;
// //         user.lastName = lastName;
// //         user.addrs1 = addrs1;
// //         user.addrs2 = addrs2;
// //         user.password = password;
// //         await user.save();
// //         res.status(200).send("Details Updated");
// //       } else {
// //         res.status(404).send("User not found");
// //       }
// //     } else {
// //       res.status(400).send("Please Login First...");
// //     }
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.log(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Clear Cart
// // const clearCart = async (req, res) => {
// //   try {
// //     // Extracting Data from Request
// //     const userId = req.cookies.userId;

// //     // Searching User in Database
// //     const user = await User.findById(userId);

// //     // Set Order Placed Array to Cart Array and Set Orignal Cart Array to Empty
// //     user.orderPlaced = user.cart;
// //     user.cart = [];

// //     // Waiting to get Saved in Database
// //     await user.save();
// //     res.status(200).send("Cart Cleared");
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.log(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to Get Order Placed Array
// // const orderPlaced = async (req, res) => {
// //   try {
// //     // If User is Present then Continue else Send Resopnse with 400 Status Code
// //     if (req.cookies.userId) {
// //       const id = req.cookies.userId;

// //       // Searching User in Database and Extracting Order Placed Array
// //       const result = await User.findById(id);
// //       const data = result.orderPlaced;
// //       res.status(200).send(data);
// //     } else {
// //       res(400).send("Bad Request");
// //     }
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.log(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // // Asynchronous function to View Details of Specific User
// // const view = async (req, res) => {
// //   try {
// //     // If User Id is present In Request Parameters then continue else Responde with 400 Status code
// //     if (req.params.userId) {
// //       const user = await User.findById(req.params.userId);
// //       res.status(200).send(user);
// //     } else {
// //       res.status(404).json({ message: "Please Login..." });
// //     }
// //   } catch (err) {
// //     // In Case of Error in Handling Request
// //     console.log(err);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // Exporting all Functions
// module.exports = {
//   status,
//   signup,
//   login,
//   logout,
//   // addToCartOnly,
//   // addToCart,
//   // getCart,
//   // removeFromCart,
//   // totalamount,
//   // addToWishList,
//   // getWishList,
//   // removeFromWishList,
//   // viewprofile,
//   // deleteUser,
//   // update,
//   // clearCart,
//   // orderPlaced,
//   // view,
// };
