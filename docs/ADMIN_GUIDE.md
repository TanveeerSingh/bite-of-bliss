# Admin Guide - Bite of Bliss

This guide explains how to set up admin accounts and use the admin dashboard to manage your bakery business.

---

## 🔑 Setting Up Your First Admin Account

### Step 1: Create a Regular Customer Account

1. Visit the [Sign Up Page](signup.html)
2. Fill in your details:
   - **Name**: Your full name
   - **Email**: Your admin email (e.g., `admin@biteofbliss.com`)
   - **Password**: A secure password (min 6 characters)
3. Click "Sign Up"

### Step 2: Promote Your Account to Admin

You have **two options**:

#### **Option A: MongoDB Atlas (Easiest for Testing)**

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Select your cluster (`biteofbliss`)
3. Click **Browse Collections**
4. Navigate to: `bakeryDB` → `users`
5. Find your user document (search by email)
6. **Edit the document**:
   - Find the `role` field (currently shows `"customer"`)
   - Change it to: `"admin"`
   - Save changes
7. Done! You're now an admin ✅

#### **Option B: Command Line (For Production)**

If using MongoDB CLI or shell:

```bash
# Connect to your database
mongosh "mongodb+srv://bakery:PASSWORD@biteofbliss.6sn0tbg.mongodb.net/?appName=biteofbliss"

# Update the user role
db.users.updateOne(
  { email: "admin@biteofbliss.com" },
  { $set: { role: "admin" } }
)
```

### Step 3: Access Admin Portal

1. Visit [Admin Login Page](admin-portal/admin-login.html)
2. Enter your credentials:
   - **Email**: Same email used for signup
   - **Password**: Same password used for signup
3. Click "Login"
4. You should see the Admin Dashboard

---

## 📊 Admin Dashboard Features

### Dashboard Sections

#### **1. Order Management**

**View All Orders**:
- See all customer orders in real-time
- Order details include:
  - Order ID
  - Customer name
  - Products ordered
  - Order total
  - Current status
  - Order date

**Update Order Status**:
- Click on any order to update its status
- Available statuses:
  - ⏳ **Pending** - New order received
  - ✅ **Confirmed** - Order confirmed
  - 🔄 **Preparing** - Order being prepared
  - 🚚 **Delivered** - Order delivered
  - ❌ **Cancelled** - Order cancelled

**Export Orders**:
- Click "Export Orders" button
- Downloads CSV file with all orders
- Use for:
  - Accounting records
  - Business analytics
  - Backup purposes

**Delete Order**:
- Remove orders if needed
- Confirmation required before deletion

---

#### **2. Inventory Management**

**View Products**:
- See all bakery products
- Details shown:
  - Product name
  - Price
  - Description
  - Availability status

**Add New Product**:
1. Click "Add Product" button
2. Fill in product details:
   - **Product Name**: Name of bakery item
   - **Price**: Product price (numbers only)
   - **Description**: Short description
   - **Image URL** (Optional)
3. Click "Add" to create product

**Edit Product**:
1. Click on product row
2. Update any field:
   - Name
   - Price
   - Description
3. Click "Save" to update

**Delete Product**:
1. Select product from list
2. Click "Delete" button
3. Confirm deletion

---

#### **3. Admin Controls**

**Logout**:
- Click "Logout" button
- Returns to admin login page
- Your session ends securely

**Access Messages**:
- Green messages = Success (product added, order updated, etc.)
- Red messages = Errors (invalid input, failed operation, etc.)
- Blue messages = Information (operation in progress)

---

## 🔐 Security Features

### JWT Token Authentication

- Admin login generates a secure JWT token
- Token expires after 7 days
- Stored securely in browser's localStorage
- Required for all admin API requests

### Role-Based Access Control

- **Regular customers** can only:
  - Browse products
  - Place orders
  - View their own orders
  - Not modify any data

- **Admins** can:
  - View all orders
  - Update order status
  - Manage all products
  - Delete orders/products
  - Access inventory

### Password Security

- Passwords are hashed with bcryptjs
- Never sent in plain text
- Minimum 6 characters required
- Only accessible to the user

---

## 📱 Admin Dashboard URLs

**Frontend Admin Pages**:
```
/admin-portal/admin-login.html      - Login page
/admin-portal/admin-dashboard.html  - Main dashboard
```

**Backend API Endpoints** (admin-only):
```
GET    /api/orders                  - Get all orders
PUT    /api/orders/:id/status       - Update order status
DELETE /api/orders/:id              - Delete order
POST   /api/products                - Create product
PUT    /api/products/:id            - Update product
DELETE /api/products/:id            - Delete product
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Admin access required" message

**Solution**: Make sure your user role is set to `"admin"` in MongoDB (not `"customer"`)

### Issue: Login fails with correct credentials

**Solution**: 
1. Verify email is registered as a customer first
2. Check MongoDB connection is active
3. Ensure role field exists and equals `"admin"`

### Issue: Can't see orders after login

**Solution**:
1. Check if you're logged in as admin (not customer)
2. Verify backend server is running
3. Check MongoDB has order data

### Issue: Export CSV isn't working

**Solution**:
1. Make sure browser allows downloads
2. Check browser console for errors (F12)
3. Ensure at least one order exists

---

## 🚀 Deployment Notes

### Production Admin Access

1. **Railway Backend**: `https://bite-of-bliss-production.up.railway.app`
2. **MongoDB Atlas**: Cloud-hosted database (already configured)
3. **Frontend**: Deploy to GitHub Pages or static host

### Setting Up Admin in Production

Same steps as local development:
1. Customer signs up on website
2. Update role to `"admin"` in MongoDB Atlas
3. Login to admin portal
4. Start managing orders and inventory

---

## 📞 Support

For issues or questions:
- Check the main [README.md](README.md)
- Review API documentation in backend folder
- Check browser console for error messages (F12)

---

**Happy managing! 🍰**
