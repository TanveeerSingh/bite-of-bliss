# 🍰 Bite of Bliss

A complete bakery e-commerce website with customer ordering and admin dashboard.

## 🌐 View Live
- **Website:** https://tanveersingh.github.io/bite-of-bliss/
- **GitHub:** https://github.com/TanveeerSingh/bite-of-bliss

## ✨ What It Does

✅ Browse bakery products  
✅ Add items to cart and place orders  
✅ Create customer account (signup/login)  
✅ Admin can manage orders and inventory  
✅ Real-time price updates  
✅ Works on mobile and desktop  

## 🛠️ Built With

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Security:** JWT tokens + password hashing

## 🚀 Get Started

### 1. Download & Install

```bash
git clone https://github.com/TanveeerSingh/bite-of-bliss.git
cd bite-of-bliss/backend
npm install
```

### 2. Setup Database

Create `.env` file in `backend/` folder:
```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/bakeryDB
JWT_SECRET=your_secret_key
```

### 3. Run Server

```bash
npm run dev
```

Open: **http://localhost:5001/**

## 👨‍💼 Admin Login

1. Sign up as a customer first
2. Go to MongoDB and change your `role` from `"customer"` to `"admin"`
3. Login to: **http://localhost:5001/admin-portal/admin-login.html**

## 📂 Files Overview

```
├── docs/          → Website (GitHub Pages)
├── frontend/      → HTML, CSS, JavaScript files
├── backend/       → Server & database code
│   ├── server.js          → Main server
│   ├── controllers/       → Business logic
│   ├── models/           → Database schemas
│   └── routes/           → API endpoints
└── images/        → Photos & logos
```

## 💡 Key Features

| Feature | Details |
|---------|---------|
| **Signup/Login** | Create account with email & password |
| **Shopping** | Browse products, add to cart, checkout |
| **Orders** | Track order history and status |
| **Admin Panel** | View all orders, update status, manage products |
| **Real-time Updates** | Product prices update automatically |

## 📞 Support

See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for detailed setup instructions.

---

**Enjoy your bakery business! 🎉**

Once logged in as admin, access the **Admin Dashboard** to:

#### 📊 **Order Management**
- View all customer orders
- Update order status (pending → confirmed → preparing → delivered → cancelled)
- Delete orders if needed
- Export order data as CSV

#### 🍰 **Inventory Management**
- Add new bakery products
- Edit product details (name, price, description)
- Delete products
- Manage product availability

#### 🔐 **Admin Features**
- Real-time order updates
- Secure admin authentication
- Admin logout option

### Admin API Endpoints (Protected)

All admin endpoints require:
1. Valid JWT token from admin account
2. User role must be `"admin"`

**Header format**:
```
Authorization: Bearer <admin_token>
```

**Available Admin Routes**:

```
POST   /api/products              - Create product
PUT    /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product
GET    /api/orders                - View all orders
PUT    /api/orders/:id/status     - Update order status
DELETE /api/orders/:id            - Delete order
```

---
