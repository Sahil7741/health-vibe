import mongoose from "mongoose";
import bcrypt from "bcrypt";  // For hashing passwords
import jwt from "jsonwebtoken";  // For generating JWT tokens
import speakeasy from "speakeasy";  // For Two-Factor Authentication (2FA)
import qrcode from "qrcode";  // For generating QR codes for 2FA
import rateLimit from "express-rate-limit";  // For rate limiting
import helmet from "helmet";  // For adding security headers to Express app
import validator from "validator";  // For input validation

const { Schema } = mongoose;

// Defining User Schema using the ES Modules format
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => validator.isLength(value, { min: 2, max: 50 }),
        message: "First name must be between 2 and 50 characters.",
      },
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => validator.isLength(value, { min: 2, max: 50 }),
        message: "Last name must be between 2 and 50 characters.",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format.",
      },
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => validator.isMobilePhone(value, "any"),
        message: "Invalid phone number format.",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (value) => validator.isLength(value, { min: 8 }),
        message: "Password must be at least 8 characters long.",
      },
    },
    membership: {
      type: String,
      enum: ["basic", "premium", "pro"],
      default: "basic",
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    twoFactorEnabled: {  // To track if user has enabled 2FA
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {  // To store the 2FA secret
      type: String,
    },
    cart: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "Item" },
        quantity: { type: Number, default: 1 },
        size: { type: String },
      },
    ],
    wishList: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "Item" },
      },
    ],
    bookedClasses: [
      {
        classId: { type: Schema.Types.ObjectId, ref: "Class" },
        date: { type: Date, required: true },
        timeSlot: { type: String },
      },
    ],
    orders: [
      {
        orderId: { type: Schema.Types.ObjectId, ref: "Order" },
        date: { type: Date, default: Date.now },
        totalAmount: { type: Number },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin", "trainer"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook for hashing password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Generate auth token method for JWT
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Check if password is valid
userSchema.methods.isPasswordValid = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Remove sensitive info before returning user object
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.twoFactorSecret;  // Don't expose 2FA secret

  return userObject;
};

// Find user by credentials (email or phone)
userSchema.statics.findByCredentials = async (emailOrPhone, password) => {
  let user;
  try {
    user = await mongoose.model("User").findOne({ email: emailOrPhone });

    if (!user) {
      user = await mongoose.model("User").findOne({ phone: emailOrPhone });
    }

    if (!user) {
      throw new Error("Unable to login. User not found.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Unable to login. Incorrect password.");
    }

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Two-Factor Authentication Setup**
userSchema.methods.setupTwoFactorAuth = async function () {
  const secret = speakeasy.generateSecret({ name: "HealthVibe" });

  // Store 2FA secret in the user document
  this.twoFactorSecret = secret.base32;
  await this.save();

  // Generate a QR code for the user to scan with an authenticator app
  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  return { secret: secret.base32, qrCode };
};

// **Two-Factor Authentication Verification**
userSchema.methods.verifyTwoFactorAuth = function (token) {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,  // Allow slight time drift
  });
};

// Creating the User model
const User = mongoose.model("User", userSchema);

// **Rate Limiting Configuration**
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
  message: "Too many login attempts from this IP, please try again after 15 minutes",
});

// **Helmet Middleware for Express Security**
const applySecurityMiddlewares = (app) => {
  app.use(helmet());  // Adds HTTP headers to secure Express app
};

// Exporting the User model, rate limiter, and security middlewares
export { User, loginLimiter, applySecurityMiddlewares };
