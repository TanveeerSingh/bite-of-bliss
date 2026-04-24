# Bite of Bliss

Bite of Bliss is a bakery web project with a customer-facing site, admin management pages, and a Node.js + MongoDB backend API.

## GitHub Pages

[![Deploy to GitHub Pages](https://github.com/TanveeerSingh/bite-of-bliss/actions/workflows/pages.yml/badge.svg)](https://github.com/TanveeerSingh/bite-of-bliss/actions/workflows/pages.yml)

Live site: [https://tanveeersingh.github.io/bite-of-bliss/](https://tanveeersingh.github.io/bite-of-bliss/)

Admin live: [https://tanveeersingh.github.io/bite-of-bliss/admin-portal/admin-login.html](https://tanveeersingh.github.io/bite-of-bliss/admin-portal/admin-login.html)

## Features

- Customer pages for browsing products and placing orders
- Authentication flow (signup/signin)
- Admin dashboard for order and inventory management
- Product and order APIs with role-based protection
- Blog section with 1 to 9 pages (including Coming Soon placeholders)

## Project Structure

```text
Bite_of_Blise-main 2/
├── index.html
├── signin.html
├── signup.html
├── stylesheet.css
├── blog1.html ... blog9.html
├── admin-portal/
├── shop/
├── images/
└── backend/
```

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs

## Run Locally

### 1) Frontend

Open `index.html` directly in browser, or serve the root folder with any static server.

### 2) Backend

```bash
cd backend
npm install
npm run dev
```

Backend defaults:

- Port: `5001` (or `PORT` from `.env`)
- Mongo URI: `MONGO_URI` from `.env` (fallback: local MongoDB)

## Environment Variables (backend/.env)

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/bakeryDB
JWT_SECRET=your_secret_here
```

## API Overview

Base URL: `http://localhost:5001/api`

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Products

- `GET /products`
- `GET /products/:id`
- `POST /products` (admin)
- `PUT /products/:id` (admin)
- `DELETE /products/:id` (admin)
- `POST /products/bootstrap` (seed default products)

### Orders

- `POST /orders` (authenticated user)
- `GET /orders/my-orders` (authenticated user)
- `GET /orders` (admin)
- `PUT /orders/:id/status` (admin)
- `DELETE /orders/:id` (admin)

Auth header format:

```text
Authorization: Bearer <token>
```

## Website Preview

Open the main site pages here:

- [Homepage](index.html)
- [Sign In](signin.html)
- [Sign Up](signup.html)
- [Admin Login](admin-portal/admin-login.html)
- [Admin Dashboard](admin-portal/admin-dashboard.html)
- [Admin Orders](shop/admin-orders.html)

## Notes

- Admin-only endpoints require a user with role `admin`.
- To promote a user as admin, update that user record in MongoDB.
