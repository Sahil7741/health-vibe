# Health Vibe / Yoga Master — Backend API Documentation

This document lists the backend API endpoints for the Health Vibe (Yoga Master) project and explains authentication, request formats, and example usages.

Base server
- By default the server listens on `process.env.PORT` or `5000`.
- Example local base URL: `http://localhost:5000`

Quick start
- Install dependencies and run server from the `backend` folder:

```bash
cd backend
npm install
# Run directly with node (recommended if entry file is `app.js`):
node app.js
# or with nodemon (adjust script if needed):
npx nodemon app.js
```

Environment variables
- Configure a `.env` file in `backend/` with at least:
  - `PORT` (optional)
  - `MONGO_URI` (MongoDB connection string)
  - `JWT_SECRET` (secret used to sign JWTs)
  - `STRIPE_SECRET` (if Stripe payments are used)

Auth
- The project uses JWT for protected routes. Include the token in requests using the `Authorization` header as:

```
Authorization: Bearer <token>
```

Routes overview
- The backend route files are under `backend/routes/`.
- Controllers are in `backend/controllers/` and models in `backend/models/`.

Auth routes (backend/routes/authRoutes.js)
- POST /new-user
  - Description: Create / register a new user.
  - Body: user object (depends on frontend shape)

- POST /api/set-token
  - Description: Save or set client token (used by frontend for push/notification or auth flow)

User routes (backend/routes/userRoutes.js)
- GET /users
  - Description: Get all users (public/admin)

- GET /users/:id
  - Description: Get user by id

- GET /user/:email
  - Description: Get user by email (protected — `verifyJWT`)

- DELETE /delete-user/:id
  - Description: Delete a user (protected — `verifyJWT`, `verifyAdmin`)

- PUT /update-user/:id
  - Description: Update a user (protected — `verifyJWT`, `verifyAdmin`)

Class routes (backend/routes/classRoutes.js)
- POST /new-class
  - Description: Create a class (protected — `verifyJWT`, `verifyInstructor`)

- GET /classes/:email
  - Description: Get classes added by an instructor (protected — `verifyJWT`, `verifyInstructor`)

- GET /classes
  - Description: Get all classes (public)

- GET /classes-manage
  - Description: Admin management view of classes

- PUT /change-status/:id
  - Description: Change approval/status of a class (protected — `verifyJWT`, `verifyAdmin`)

- GET /approved-classes
  - Description: Get approved classes (public)

- PUT /update-class/:id
  - Description: Update a class (protected — `verifyJWT`, `verifyInstructor`)

- GET /class/:id
  - Description: Get class by id (public)

Cart routes (backend/routes/cartRoutes.js)
- POST /add-to-cart
  - Description: Add item to cart (protected — `verifyJWT`)
  - Body: cart item info (user, classId, price, etc.)

- GET /cart-item/:id
  - Description: Get a cart item by id (protected — `verifyJWT`)

- GET /cart/:email
  - Description: Get cart by user email (protected — `verifyJWT`)

- DELETE /delete-cart-item/:id
  - Description: Delete cart item by id (protected — `verifyJWT`)

Payment routes (backend/routes/paymentRoutes.js)
- POST /create-payment-intent
  - Description: Create Stripe payment intent (protected — `verifyJWT`)
  - Body: { amount, currency, ... }

- POST /payment-info
  - Description: Store payment info / record (protected — `verifyJWT`)
  - Body: payment metadata

- GET /payment-history/:email
  - Description: Get payment history for a user

- GET /payment-history-length/:email
  - Description: Get count/length of a user's payment history

Other utility routes (backend/routes/otherRoutes.js)
- GET /popular_classes
  - Description: Get popular classes

- GET /popular-instructors
  - Description: Get popular instructors

- GET /instructors
  - Description: Get all instructors

- GET /admin-stats
  - Description: Get admin statistics (protected — `verifyJWT`, `verifyAdmin`)

- GET /enrolled-classes/:email
  - Description: Get enrolled classes for a user (protected — `verifyJWT`)

- POST /as-instructor
  - Description: Apply or add instructor (public)

- GET /applied-instructors/:email
  - Description: Get applied instructors for an email

Models (backend/models)
- User.js — user data
- Class.js — class/course data
- Cart.js — cart items
- Payment.js — payment records
- Applied.js — applied instructor records
- Enrolled.js — enrolled classes

Example requests

- Get all classes (public)

```bash
curl -X GET "http://localhost:5000/classes"
```

- Add to cart (protected)

```bash
curl -X POST "http://localhost:5000/add-to-cart" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"student@example.com","classId":"<classId>","price":100}'
```

Notes and tips
- Check `backend/controllers/` to see the exact request body shapes expected by each controller.
- Protected routes use middleware in `backend/middleware/authMiddleware.js` — read it to understand roles (`verifyAdmin`, `verifyInstructor`).
- If `package.json` references `index.js` but `app.js` is used as the server entry, start the server with `node app.js` or adjust `package.json` accordingly.

Want improvements?
- I can: add OpenAPI/Swagger spec, add example response bodies per endpoint, or generate a Postman collection — tell me which.

---
Generated by the project maintainer assistant.
