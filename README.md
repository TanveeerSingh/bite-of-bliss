# Bite of Bliss

Bite of Bliss is a simple bakery website where customers can browse products, sign up/sign in, add items to a cart, and place orders. An admin user can view orders, update order status, and manage product stock from a dashboard.

## Features
- Customer-facing product listing, cart and order flow
- Authentication (register / login)
- Admin dashboard to view and update orders and inventory
- REST API backend (Express + MongoDB)

## Languages and Technologies Used
- HTML5
- CSS3
- JavaScript (Frontend + Backend)
- Node.js
- Express.js
- MongoDB
- Mongoose

## Prerequisites
- Node.js (LTS) and `npm`
- MongoDB (local or hosted)

## Quick Start (simple)
Follow these minimal steps to run the project locally:

1. Install MongoDB on your computer and make sure the service is running.

2. Download or clone this repository and open the project folder in VS Code.

3. Open a terminal in VS Code and run:

```bash
cd backend
npm install
npm run dev
```

After this command, the terminal shows the local backend link (example: `http://localhost:5001`).

- Frontend home page: `http://localhost:5001/index.html#home`
- Admin login page: `http://localhost:5001/admin-portal/admin-login.html`

Now users can visit the website, create an account, and place orders.

## How to become admin after creating an account
1. Create a normal account from the signup page.
2. Open MongoDB (MongoDB Compass or `mongosh`).
3. Find your user in the `users` collection.
4. Change the `role` field from `user` to `admin`.
5. Login again from the admin login page.

After this, users can place orders and the admin can see all placed order details in the admin dashboard.
