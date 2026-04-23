Bakery Backend API (MongoDB + Express)

This backend is intentionally kept simple so it is easy to learn and maintain.

Tech used
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication

How to run
1. Open terminal in backend folder
2. Install dependencies
   npm install
3. Start server
   npm run dev

Default config
- Port: 5001 (or value from PORT in .env)
- MongoDB URI: from MONGO_URI in .env

Auth routes
- POST /api/auth/register
  body: { name, email, password }
- POST /api/auth/login
  body: { email, password }

Product routes
- GET /api/products
- GET /api/products/:id
- POST /api/products (admin only)
- PUT /api/products/:id (admin only)
- DELETE /api/products/:id (admin only)

Order routes
- POST /api/orders (logged-in user)
  body: { items: [{ productId, quantity }], shippingAddress }
- GET /api/orders/my-orders (logged-in user)
- GET /api/orders (admin only)
- PUT /api/orders/:id/status (admin only)
  body: { status }

Auth header format
- Authorization: Bearer <token>

How to make an admin user
- Register a user first
- In MongoDB, set that user's role field to admin

Project structure
- server.js
- models/
- controllers/
- routes/
- middleware/

This layout keeps each file focused on one job:
- models define data shape
- controllers contain business logic
- routes map endpoints to controllers
- middleware handles shared checks like authentication
