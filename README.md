# Sunshine Paper Store - Local Paper Merchant Management System

A comprehensive inventory and order management system for a local paper merchant business. Built with Next.js, Prisma, and SQLite.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Features](#features)
  - [Dashboard](#dashboard)
  - [Inventory Management](#inventory-management)
  - [Customer Management](#customer-management)
  - [Order Management](#order-management)
  - [Vendor Management](#vendor-management)
  - [Financial Ledger](#financial-ledger)
- [Price Calculation](#price-calculation)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Design System](#design-system)

---

## Project Overview

**Sunshine Paper Store** (also known as **Local Paper Merchant**) is a complete business management application for a paper products store. It handles inventory, customer management, orders, vendor purchases, and financial tracking all in one place.

### Key Business Features:
- Track paper and card inventory with GSM, dimensions, and quantities
- Manage customer profiles with ledger tracking
- Create and manage orders with automatic price calculation
- Handle vendor purchases and track dues
- Complete financial ledger for both customers and vendors

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | SQLite |
| **ORM** | Prisma 5.22 |
| **Icons** | Lucide React |
| **Utilities** | date-fns |

---

## Project Structure

```
sunshine-paper-store/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── customers/     # Customer API
│   │   │   ├── dashboard/     # Dashboard API
│   │   │   ├── finances/      # Finance API
│   │   │   ├── inventory/     # Inventory API
│   │   │   ├── orders/       # Orders & Purchases API
│   │   │   └── vendors/      # Vendor API
│   │   ├── customers/         # Customer page
│   │   ├── dashboard/         # Dashboard page
│   │   ├── finances/          # Financial ledger page
│   │   ├── inventory/         # Inventory page
│   │   ├── orders/            # Orders page
│   │   ├── vendors/           # Vendor page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   └── lib/
│       ├── prisma.ts          # Prisma client
│       └── types.ts           # TypeScript types
├── package.json
└── README.md
```

---

## Database Schema

### Models

| Model | Description |
|-------|-------------|
| **InventoryItem** | Stores paper/card products with name, category, dimensions (L×W), GSM, quantity, and unit |
| **Customer** | Customer profiles with name, email, phone, address |
| **Vendor** | Vendor profiles with name, email, phone, address |
| **Order** | Customer orders with totalAmount, paidAmount, status (pending/delivered/cancelled), paymentStatus, isCancelled |
| **OrderItem** | Individual items in an order with all details (name, category, dimensions, GSM, quantity, rate, total) |
| **Purchase** | Vendor purchases with totalAmount, paidAmount, status, paymentStatus |
| **PurchaseItem** | Individual items in a purchase |
| **CustomerTransaction** | Customer ledger entries (type: debit/credit, amount, description, paymentMode, reference, balance) |
| **VendorTransaction** | Vendor ledger entries |

### Relationships
- Customer → Orders (one-to-many)
- Customer → CustomerTransactions (one-to-many)
- Vendor → Purchases (one-to-many)
- Vendor → VendorTransactions (one-to-many)
- Order → OrderItems (one-to-many)
- OrderItem → InventoryItem (many-to-one, optional)
- Purchase → PurchaseItems (one-to-many)

---

## Features

### Dashboard
- **Summary Cards**: Total inventory items, customers, vendors, orders (clickable to navigate)
- **Statistics**:
  - Total Stock Value (sum of all inventory quantities)
  - Outstanding Credits (customer balance due)
  - Total Sales (sum of all order amounts)
  - Vendor Dues (vendor balance due)
- **Low Stock Alerts**: Shows items below threshold
- **Recent Orders**: Last 5 orders

### Inventory Management
- **Add Items**: Name, category (Card/Paper/Sheets), dimensions (L×W), GSM, quantity, unit, low stock threshold
- **Default Values**:
  - Category: Card
  - Quantity: 0
  - Unit: Auto-updates (Pkts for Card, Rims for Paper, Pcs for Sheets)
- **View**: Table with all inventory items
- **Edit/Delete**: Update or remove items
- **Low Stock Indicators**: Alert icon for items below threshold
- **Navigation**: Back button to landing page

### Customer Management
- **Add Customers**: Name, email, phone, address
- **View Customers**: Expandable cards showing all details
- **Amount Due**: Shows balance with color coding (red if due, green if credit)
- **Actions**:
  - Edit customer
  - Delete customer (cascades to orders, transactions)
  - View Ledger
  - Add Payment
- **Customer Ledger Modal**:
  - Shows transaction history
  - Print functionality
  - Clear ledger button

### Order Management
- **Create Order**:
  - Select customer
  - Add items from inventory or custom items
  - Item details: Name, category, dimensions, GSM, quantity, rate
  - Manual entry for custom items
  - Auto price calculation based on formula
- **Order Status**:
  - Pending (default)
  - Delivered
  - Cancelled
- **Payment Status**:
  - Paid
  - Unpaid
  - Refunded (for cancelled orders)
- **Actions**:
  - View Details (modal with full item list)
  - Mark as Delivered
  - Cancel Order (updates ledger, restores inventory)
  - Add Payment
  - Delete Order
- **Filters**:
  - Status: All, Pending, Delivered, Cancelled
  - Payment: All, Paid, Unpaid
- **Order Details Modal**:
  - Shows all items with full details
  - Total, Paid, Balance
  - Payment status

### Vendor Management
- **Add Vendors**: Name, email, phone, address
- **View Vendors**: Cards with all details
- **Amount Due**: Shows vendor balance
- **Actions**:
  - Edit vendor
  - Delete vendor
  - View Ledger
  - Add Payment
- **Create Purchase**:
  - Select vendor
  - Add items with details
  - Auto price calculation
  - Payment during purchase
  - Auto-adds to inventory

### Financial Ledger
- **Tabs**: Customers / Vendors
- **Customer Ledger**:
  - Transaction list with date, description, mode, reference
  - Debit/Credit columns
  - Running balance
  - Filter by transaction type
- **Vendor Ledger**: Same structure as customer
- **Statistics**:
  - Total Sales (customer debits)
  - Total Credits (customer credits)
  - Net Balance
- **Actions**:
  - Add Transaction (manual entry)
  - Print Ledger
  - Clear Ledger (delete all transactions)
- **Transaction Types**:
  - Debit (money owed)
  - Credit (payment received)

---

## Price Calculation

The system automatically calculates prices based on category and GSM:

### Formula

| GSM Range | Category | Formula |
|-----------|----------|---------|
| ≤ 199 | Paper | `Length × Width × GSM × Quantity × Rate ÷ 3100` |
| ≥ 200 | Card | `Length × Width × GSM × Quantity × Rate ÷ 15500` |
| N/A | Sheets | `Rate per Sheet × Quantity` |

### Notes:
- Sheets category uses direct rate per piece (no dimensions/GSM needed)
- Rate is entered manually when creating orders/purchases
- Unit auto-adjusts: Pkts (Card), Rims (Paper), Pcs (Sheets)

---

## API Endpoints

### Inventory
- `GET /api/inventory` - List all items
- `POST /api/inventory` - Create item
- `GET /api/inventory/[id]` - Get single item
- `PUT /api/inventory/[id]` - Update item
- `DELETE /api/inventory/[id]` - Delete item

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer with transactions
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer (cascades orders/transactions)
- `POST /api/customers/[id]/payments` - Add payment
- `DELETE /api/customers/[id]/ledger` - Clear customer ledger

### Orders
- `GET /api/orders` - List all orders with items
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get single order
- `PATCH /api/orders/[id]` - Update order (status, payment, cancel)
- `DELETE /api/orders/[id]` - Delete order (reverses ledger, restores inventory)

### Vendors
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors/[id]` - Get vendor with transactions
- `PUT /api/vendors/[id]` - Update vendor
- `DELETE /api/vendors/[id]` - Delete vendor
- `POST /api/vendors/[id]/payments` - Add payment
- `DELETE /api/vendors/[id]/ledger` - Clear vendor ledger

### Purchases
- `GET /api/orders/purchases` - List all purchases
- `POST /api/orders/purchases` - Create purchase
- `DELETE /api/orders/purchases` - Delete purchase (reverses ledger)

### Finances
- `GET /api/finances/customer-transactions` - All customer transactions
- `POST /api/finances/customer-transactions` - Add customer transaction
- `GET /api/finances/vendor-transactions` - All vendor transactions
- `POST /api/finances/vendor-transactions` - Add vendor transaction
- `DELETE /api/finances/clear` - Clear ledger (type: customers/vendors/all)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd sunshine-paper-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   ```bash
   npx prisma db push
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Design System

### Color Theme
- **Primary**: Emerald Green (#10b981 / rgb(16, 185, 129))
- **Background**: White (#ffffff)
- **Text**: Gray (#1f2937, #4b5563, #6b7280)
- **Accent Colors**:
  - Blue for customers
  - Orange for vendors
  - Purple for orders

### UI Components
- **Buttons**: Primary (green), Secondary (outline), Danger (red)
- **Cards**: White with shadow, rounded corners
- **Tables**: Clean layout with hover states
- **Forms**: Input fields with labels
- **Modals**: Centered overlays with close button

### Icons Used
- Lucide React icons throughout (Book, Package, Users, Truck, DollarSign, etc.)

---

## Currency

All monetary values are displayed in **PKR** (Pakistani Rupees) throughout the application.

---

## Key Behaviors

### Order Creation
1. Creates order record
2. Creates order items
3. Decrements inventory (if items linked)
4. Creates debit transaction in customer ledger
5. Creates credit transaction if payment made

### Order Cancellation
1. Creates credit to reverse debit
2. Creates debit to refund payment (if any)
3. Restores inventory quantities
4. Marks order as cancelled

### Order Deletion
1. Reverses all ledger entries
2. Restores inventory
3. Deletes order items and order

### Customer Deletion
1. Cascades to orders (with ledger reversal)
2. Cascades to transactions

---

## Notes

- This project uses SQLite for simplicity (file-based, no setup required)
- Prisma schema can be easily modified for PostgreSQL or MySQL
- The application is fully responsive
- Print functionality available for ledgers
- Back buttons on all pages navigate to the last active section