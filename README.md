# 🍰 Bite of Bliss - Bakery E-Commerce Platform

> A complete full-stack bakery ordering system with customer portal and admin dashboard

---

## 🌐 Quick Links

### **[👉 VIEW HOMEPAGE 👈](https://tanveersingh.github.io/bite-of-bliss/)**
**No download needed! Click above to see the live website.**

### **[🔐 ADMIN LOGIN PAGE](https://tanveersingh.github.io/bite-of-bliss/admin-portal/admin-login.html)**
**For admins to manage orders and inventory.**

---

## ✨ Features

- 🛍️ **Browse Products** - Beautiful product showcase with real-time pricing
- 🛒 **Shopping Cart** - Add items and place orders easily
- 👤 **User Accounts** - Signup, login, and track your orders
- 📦 **Order Tracking** - View order history and status updates
- 👨‍💼 **Admin Dashboard** - Manage orders, inventory, and products
- 📱 **Mobile Friendly** - Works perfectly on all devices
- 🔐 **Secure** - Password hashing and JWT authentication
- ⚡ **Real-time Updates** - Live price synchronization

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js installed
- MongoDB running locally

### Setup

```bash
# 1. Clone this repository
git clone https://github.com/TanveeerSingh/bite-of-bliss.git
cd bite-of-bliss

# 2. Install backend
cd backend
npm install

# 3. Create .env file
cat > .env << EOF
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/bakeryDB
JWT_SECRET=your_secret_key_here
EOF

# 4. Start server
npm run dev
```

Then open: **http://localhost:5001/**

---

## 🏗️ Project Structure

```
bite-of-bliss/
├── 📁 docs/              ← Website files (GitHub Pages)
├── 📁 frontend/          ← HTML, CSS, JavaScript
├── 📁 backend/           ← Node.js/Express API
│   ├── controllers/      ← Business logic
│   ├── models/          ← Database schemas
│   └── routes/          ← API endpoints
├── 📁 images/           ← Photos & logos
└── README.md            ← This file
```

---

## 👨‍💼 Admin Access

### How to become admin:

1. Sign up as a regular customer
2. Go to MongoDB and change your `role` to `"admin"`
3. Login to admin dashboard at: **http://localhost:5001/admin-portal/admin-login.html**

**Admin can:**
- View all customer orders
- Update order status
- Manage product inventory
- Export order data
- View sales analytics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Security | JWT, bcryptjs |

---

## 📱 Live Website Features

The website on GitHub Pages includes:
- ✅ Homepage with product menu
- ✅ User signup/login
- ✅ Shopping cart (stored in browser)
- ✅ Blog pages (9 articles)
- ✅ Mobile-responsive design
- ℹ️ Admin features work only when backend is running locally

---

## 📄 Documentation

- **[Full Admin Guide](docs/ADMIN_GUIDE.md)** - Detailed admin setup and features
- **[GitHub Repository](https://github.com/TanveeerSingh/bite-of-bliss)**
- **[Live Website](https://tanveersingh.github.io/bite-of-bliss/)**

---

## 🔗 Links

| Link | Purpose |
|------|---------|
| [🌐 Live Website](https://tanveersingh.github.io/bite-of-bliss/) | Preview without downloading |
| [💻 GitHub Repo](https://github.com/TanveeerSingh/bite-of-bliss) | Source code |
| [📚 Admin Guide](docs/ADMIN_GUIDE.md) | Detailed instructions |

---

## 💡 Development Tips

```bash
# Watch for changes and auto-restart
cd backend && npm run dev

# Check if MongoDB is running
mongo --version

# Reset database
# Delete all collections in MongoDB Atlas
```

---

## 📞 Questions?

Check the [Admin Guide](docs/ADMIN_GUIDE.md) for detailed setup instructions or feel free to open an issue on GitHub.

---

**Built with ❤️ for bakery businesses | Made with Node.js, Express, MongoDB**
