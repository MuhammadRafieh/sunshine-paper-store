# SUNSHINE PAPER STORE (LOCAL PAPER MERCHANT)
## Software Quality Assurance (SQA) - Lab Manual
### Complete Project Documentation

---

## TABLE OF CONTENTS

- [Lab 01: Software Requirement Specification (SRS)](#lab-01-software-requirement-specification-srs)
- [Lab 02: UML Diagrams](#lab-02-uml-diagrams)
- [Lab 03: Entity Relationship Diagram (ERD)](#lab-03-entity-relationship-diagram-erd)
- [Lab 04: Database Implementation](#lab-04-database-implementation)
- [Lab 05: Data Access Layer (DAL) and Form Design](#lab-05-data-access-layer-dal-and-form-design)
- [Lab 06: Implementing Interfaces](#lab-06-implementing-interfaces)
- [Lab 07: Business Logic Layer (BLL)](#lab-07-business-logic-layer-bll)
- [Lab 08: Run and Test - Verification and Validation](#lab-08-run-and-test--verification-and-validation)
- [Lab 09: Shopping Module Creation](#lab-09-shopping-module-creation)
- [Lab 10: Payment Module Creation](#lab-10-payment-module-creation)
- [Lab 11: Admin Panel and Reporting Interface](#lab-11-admin-panel-and-reporting-interface)

---

# Lab 01: Software Requirement Specification (SRS)

## 1.1 Introduction

**Project Name:** Sunshine Paper Store (Local Paper Merchant Management System)

**Project Type:** Web Application - Business Management System

**Project Description:** A comprehensive inventory and order management system for a local paper merchant business that handles inventory, customer management, orders, vendor purchases, and financial tracking.

## 1.2 Purpose

The purpose of this project is to develop a complete business management application for paper merchants to:
- Track paper and card inventory with GSM, dimensions, and quantities
- Manage customer profiles with ledger tracking
- Create and manage orders with automatic price calculation
- Handle vendor purchases and track dues
- Maintain complete financial ledger for both customers and vendors

## 1.3 Scope

### In-Scope Features:
1. Dashboard with business overview
2. Inventory Management (Add, Edit, Delete, View)
3. Customer Management with ledger
4. Order Management (Create, Cancel, Delete, Track)
5. Vendor Management with purchases
6. Financial Ledger (Customer & Vendor)
7. Price Calculation System
8. Print functionality for ledgers
9. Low stock alerts

### Out of Scope:
- Multi-user authentication
- Cloud deployment
- Mobile app
- Barcode/QR scanning

## 1.4 User Characteristics

### Primary Users:
- Shop Owner/Manager
- Sales Staff
- Inventory Manager
- Accountant

## 1.5 Functional Requirements

### FR-01: Dashboard
- Display summary statistics (inventory count, customers, vendors, orders)
- Show outstanding credits and vendor dues
- Low stock alerts display
- Recent orders listing
- Clickable cards to navigate to sections

### FR-02: Inventory Management
- Add new inventory items with: Name, Category (Card/Paper/Sheets), Dimensions (L×W), GSM, Quantity, Unit, Low Stock Threshold
- Default values: Category = Card, Quantity = 0, Unit auto-adjusts
- Edit existing items
- Delete items
- Low stock visual indicators

### FR-03: Customer Management
- Add customers with: Name, Email, Phone, Address
- View customer list in expandable cards
- Show amount due with color coding
- Edit customer details
- Delete customer (cascades to orders and transactions)
- View customer ledger
- Add payments to customer account

### FR-04: Order Management
- Create new orders by selecting customer
- Add items from inventory OR custom items
- Auto-calculate price based on formula
- Order statuses: Pending, Delivered, Cancelled
- Payment statuses: Paid, Unpaid, Refunded
- View order details in modal
- Mark order as delivered
- Cancel order (updates ledger, restores inventory)
- Add payment to order
- Delete order

### FR-05: Vendor Management
- Add vendors with: Name, Email, Phone, Address
- View vendor list
- Show amount due
- Edit vendor details
- Delete vendor
- View vendor ledger
- Add payment to vendor
- Create purchases from vendors

### FR-06: Financial Ledger
- View customer transactions (debit/credit)
- View vendor transactions (debit/credit)
- Add manual transactions
- Print ledger functionality
- Clear ledger functionality
- Filter by transaction type

## 1.6 Non-Functional Requirements

### Performance:
- Page load time: < 3 seconds
- API response time: < 1 second
- Support up to 10,000 records

### Usability:
- User-friendly interface
- Green and White theme throughout
- PKR as currency
- Book icon instead of sun emoji
- Back buttons on all pages

### Reliability:
- Data integrity maintained
- Automatic ledger updates
- Inventory restoration on order cancellation/deletion

---

# Lab 02: UML Diagrams

## 2.1 Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUNSHINE PAPER STORE USE CASES                       │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   ACTOR      │
                              │  (User)      │
                              └──────┬───────┘
                                     │
         ┌─────────────┬─────────────┼─────────────┬──────────────┐
         │             │             │             │              │
         ▼             ▼             ▼             ▼              ▼
┌─────────────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│   DASHBOARD    │ │ INVENTORY │ │CUSTOMERS  │ │  ORDERS   │ │  VENDORS  │
├─────────────────┤ ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤
│-View Summary   │ │-Add Item  │ │-Add Cust. │ │-Create    │ │-Add Vendor│
│-View Alerts    │ │-Edit Item │ │-Edit Cust.│ │  Order    │ │-Edit Vend.│
│-Navigate       │ │-Delete    │ │-Delete    │ │-Deliver   │ │-Delete    │
│                │ │-View      │ │-View      │ │-Cancel    │ │-View      │
│                │ │           │ │  Ledger   │ │-Delete    │ │  Ledger   │
│                │ │           │ │-Add Pay.  │ │-Add Pay.  │ │-Add Pay.  │
└─────────────────┘ └───────────┘ └───────────┘ │-View      │ └───────────┘
                                                │  Details  │
                                                └───────────┘
                                                         │
                                                         ▼
                                              ┌───────────────┐
                                              │   PURCHASES   │
                                              ├───────────────┤
                                              │-Create Purchase│
                                              │-Delete Purchase│
                                              └───────────────┘
                                                         │
                                                         ▼
                                              ┌───────────────┐
                                              │    FINANCES   │
                                              ├───────────────┤
                                              │-View Ledger  │
                                              │-Add Trans.   │
                                              │-Print Ledger │
                                              │-Clear Ledger │
                                              └───────────────┘
```

## 2.2 Activity Diagrams

### 2.2.1 Order Creation Activity
```
┌─────────────────────────┐
│   START: Create Order   │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Select Customer         │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Add Items (Inventory/  │
│        Custom)          │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Calculate Total Price  │
│ (Auto Formula)          │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Enter Payment (if any)  │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Submit Order            │
└───────────┬─────────────┘
            ▼
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌────────────┐
│ Create │    │ Decrement  │
│ Order  │    │ Inventory  │
│ Record │    │ (if linked)│
└───┬────┘    └─────┬──────┘
    │               │
    ▼               ▼
┌─────────────────────────┐
│ Create Customer Ledger  │
│    Transaction          │
│ (Debit + Credit if paid)│
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│    END: Order Created   │
└─────────────────────────┘
```

### 2.2.2 Order Cancellation Activity
```
┌─────────────────────────┐
│ START: Cancel Order    │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Create Credit Entry     │
│ (Reverse Order Debit)   │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Check if Payment Made?  │
└───────────┬─────────────┘
            ▼
    ┌───────┴───────┐
    │               │
    ▼               ▼
   YES              NO
    │               │
    ▼               ▼
┌──────────────────┐
│ Create Debit     │
│ Entry (Refund)   │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│ Restore Inventory      │
│    Quantity             │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Mark Order as          │
│    Cancelled            │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│   END: Order Cancelled │
└─────────────────────────┘
```

## 2.3 Sequence Diagrams

### 2.3.1 Create Order Sequence
```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  User   │  │Frontend │  │  API   │  │Prisma  │  │SQLite  │
└────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
     │            │            │            │            │
     │Submit Order│            │            │            │
     │───────────>│            │            │            │
     │            │POST /api/orders         │            │
     │            │────────────────────────>│            │
     │            │            │Insert Order│            │
     │            │            │───────────>│            │
     │            │            │            │───────┐    │
     │            │            │            │       │    │
     │            │            │            │<──────┘    │
     │            │            │            │Insert Items │
     │            │            │            │───────────>│
     │            │            │            │            │───────┐
     │            │            │            │            │       │
     │            │            │            │            │<──────┘
     │            │            │            │Update Inv. │
     │            │            │            │───────────>│
     │            │            │            │            │
     │            │            │            │Create Trans│
     │            │            │            │───────────>│
     │            │            │            │            │
     │            │Return Order            │            │
     │            │<──────────────────────│            │
     │            │            │            │            │
     │ Display Success         │            │            │
     │<───────────│            │            │            │
     │            │            │            │            │
```

---

# Lab 03: Entity Relationship Diagram (ERD)

## 3.1 Complete ERD

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        SUNSHINE PAPER STORE - ERD                                │
└──────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│   InventoryItem │           │    Customer     │           │     Vendor      │
├─────────────────┤           ├─────────────────┤           ├─────────────────┤
│ id (PK)         │◄──────────│ id (PK)         │           │ id (PK)         │
│ name            │    ┌──────│ name            │           │ name            │
│ category        │    │      │ email           │           │ email           │
│ length          │    │      │ phone           │           │ phone           │
│ width           │    │      │ address         │           │ address         │
│ gsm             │    │      │ createdAt       │           │ createdAt       │
│ quantity        │    │      └────────┬────────┘           └────────┬────────┘
│ unit            │    │               │                            │
│ lowStockThreshold              │               │                            │
│ createdAt       │    │               │                            │
│ updatedAt       │    │               │ 1:N                       │ 1:N
│                 │    │               ▼                            ▼
└────────┬────────┘    │      ┌─────────────────┐           ┌─────────────────┐
         │           │      │     Order       │           │    Purchase     │
         │1:N        │      ├─────────────────┤           ├─────────────────┤
         ▼           │      │ id (PK)         │           │ id (PK)         │
┌─────────────────┐  │      │ customerId (FK)│◄──────────│ vendorId (FK)   │
│    OrderItem    │  │      │ totalAmount    │           │ totalAmount     │
├─────────────────┤  │      │ paidAmount     │           │ paidAmount      │
│ id (PK)         │  │      │ status         │           │ status          │
│ orderId (FK)    │──┼──────│ paymentStatus  │           │ paymentStatus   │
│ inventoryItemId │  │      │ isCancelled    │           │ createdAt       │
│ (FK, NULL)      │  │      │ createdAt      │           │ updatedAt       │
│ name            │  │      │ updatedAt      │           └────────┬────────┘
│ category        │  │      └────────┬────────┘                    │
│ length          │  │               │                             │ 1:N
│ width           │  │               │ 1:N                         ▼
│ gsm             │  │               ▼                     ┌─────────────────┐
│ unit            │  │      ┌─────────────────┐            │  PurchaseItem   │
│ quantity        │  │      │CustomerTransaction           ├─────────────────┤
│ rate            │  │      ├─────────────────┤            │ id (PK)         │
│ total           │  │      │ id (PK)         │            │ purchaseId (FK) │
│ createdAt       │  │      │ customerId (FK) │            │ name            │
└─────────────────┘  │      │ type            │            │ category        │
                     │      │ amount          │            │ length          │
                     │      │ description     │            │ width           │
                     │      │ paymentMode     │            │ gsm             │
                     │      │ reference       │            │ quantity        │
                     │      │ balance         │            │ unit            │
                     │      │ createdAt       │            │ rate            │
                     │      └─────────────────┘            │ total           │
                     │                                   │ createdAt       │
                     │                                   └─────────────────┘
                     │
                     │      ┌─────────────────┐
                     │      │VendorTransaction│
                     │      ├─────────────────┤
                     │      │ id (PK)         │
                     └─────►│ vendorId (FK)   │
                            │ type            │
                            │ amount          │
                            │ description     │
                            │ paymentMode     │
                            │ reference       │
                            │ balance         │
                            │ createdAt       │
                            └─────────────────┘
```

## 3.2 Entity Descriptions

| Entity | Description | Attributes |
|--------|-------------|------------|
| **InventoryItem** | Paper/card products | id, name, category, length, width, gsm, quantity, unit, lowStockThreshold, createdAt, updatedAt |
| **Customer** | Customer profiles | id, name, email, phone, address, createdAt, updatedAt |
| **Vendor** | Vendor profiles | id, name, email, phone, address, createdAt, updatedAt |
| **Order** | Customer orders | id, customerId, totalAmount, paidAmount, status, paymentStatus, isCancelled, createdAt, updatedAt |
| **OrderItem** | Items in orders | id, orderId, inventoryItemId, name, category, length, width, gsm, unit, quantity, rate, total, createdAt |
| **Purchase** | Vendor purchases | id, vendorId, totalAmount, paidAmount, status, paymentStatus, createdAt, updatedAt |
| **PurchaseItem** | Items in purchases | id, purchaseId, name, category, length, width, gsm, quantity, unit, rate, total, createdAt |
| **CustomerTransaction** | Customer ledger | id, customerId, type, amount, description, paymentMode, reference, balance, createdAt |
| **VendorTransaction** | Vendor ledger | id, vendorId, type, amount, description, paymentMode, reference, balance, createdAt |

---

# Lab 04: Database Implementation

## 4.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Database | SQLite |
| ORM | Prisma 5.22 |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |

## 4.2 Prisma Schema

```prisma
// File: prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model InventoryItem {
  id          String   @id @default(cuid())
  name        String
  category    String
  length      Float
  width       Float
  gsm         Int
  quantity    Int
  unit        String
  lowStockThreshold Int @default(10)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orderItems  OrderItem[]
}

model Customer {
  id          String   @id @default(cuid())
  name        String
  email       String?
  phone       String?
  address     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      Order[]
  transactions CustomerTransaction[]
}

model Vendor {
  id          String   @id @default(cuid())
  name        String
  email       String?
  phone       String?
  address     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  purchases   Purchase[]
  transactions VendorTransaction[]
}

model Order {
  id              String   @id @default(cuid())
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])
  items          OrderItem[]
  totalAmount    Float
  paidAmount     Float    @default(0)
  status         String   @default("pending")
  paymentStatus  String   @default("unpaid")
  isCancelled    Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  inventoryItemId String?
  inventoryItem InventoryItem? @relation(fields: [inventoryItemId], references: [id])
  name        String
  category    String
  length      Float
  width       Float
  gsm         Int
  unit        String
  quantity    Int
  rate        Float
  total       Float
  createdAt   DateTime @default(now())
}

model Purchase {
  id              String   @id @default(cuid())
  vendorId        String
  vendor          Vendor   @relation(fields: [vendorId], references: [id])
  items          PurchaseItem[]
  totalAmount    Float
  paidAmount     Float    @default(0)
  status         String   @default("pending")
  paymentStatus  String   @default("unpaid")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model PurchaseItem {
  id          String   @id @default(cuid())
  purchaseId  String
  purchase    Purchase @relation(fields: [purchaseId], references: [id])
  name        String
  category    String
  length      Float
  width       Float
  gsm         Int
  quantity    Int
  unit        String
  rate        Float
  total       Float
  createdAt   DateTime @default(now())
}

model CustomerTransaction {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  type        String
  amount      Float
  description String
  paymentMode String?
  reference   String?
  balance     Float
  createdAt   DateTime @default(now())
}

model VendorTransaction {
  id          String   @id @default(cuid())
  vendorId    String
  vendor      Vendor   @relation(fields: [vendorId], references: [id])
  type        String
  amount      Float
  description String
  paymentMode String?
  reference   String?
  balance     Float
  createdAt   DateTime @default(now())
}
```

## 4.3 Database Setup Commands

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

---

# Lab 05: Data Access Layer (DAL) and Form Design

## 5.1 Data Access Layer Overview

The Data Access Layer is implemented through Next.js API Routes using Prisma ORM.

### File Structure:
```
src/app/api/
├── inventory/
│   ├── route.ts          # GET, POST
│   └── [id]/route.ts      # GET, PUT, DELETE
├── customers/
│   ├── route.ts           # GET, POST
│   └── [id]/
│       ├── route.ts       # GET, PUT, DELETE
│       ├── payments/      # POST
│       └── ledger/        # DELETE
├── orders/
│   ├── route.ts           # GET, POST
│   ├── [id]/route.ts      # GET, PATCH, DELETE
│   └── purchases/         # GET, POST, DELETE
├── vendors/
│   ├── route.ts           # GET, POST
│   └── [id]/
│       ├── route.ts       # GET, PUT, DELETE
│       ├── payments/      # POST
│       └── ledger/        # DELETE
├── finances/
│   ├── customer-transactions/    # GET, POST
│   ├── vendor-transactions/      # GET, POST
│   └── clear/                     # DELETE
└── dashboard/
    └── route.ts           # GET
```

## 5.2 API Endpoints Detail

### Inventory API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inventory | List all inventory items |
| POST | /api/inventory | Create new inventory item |
| GET | /api/inventory/[id] | Get single item |
| PUT | /api/inventory/[id] | Update item |
| DELETE | /api/inventory/[id] | Delete item |

### Customer API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers | List all customers |
| POST | /api/customers | Create new customer |
| GET | /api/customers/[id] | Get customer with transactions |
| PUT | /api/customers/[id] | Update customer |
| DELETE | /api/customers/[id] | Delete customer |
| POST | /api/customers/[id]/payments | Add payment |
| DELETE | /api/customers/[id]/ledger | Clear ledger |

### Order API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders | List all orders |
| POST | /api/orders | Create new order |
| GET | /api/orders/[id] | Get single order |
| PATCH | /api/orders/[id] | Update order (status/payment/cancel) |
| DELETE | /api/orders/[id] | Delete order |

### Vendor API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vendors | List all vendors |
| POST | /api/vendors | Create new vendor |
| GET | /api/vendors/[id] | Get vendor with transactions |
| PUT | /api/vendors/[id] | Update vendor |
| DELETE | /api/vendors/[id] | Delete vendor |
| POST | /api/vendors/[id]/payments | Add payment |
| DELETE | /api/vendors/[id]/ledger | Clear ledger |

### Purchase API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders/purchases | List all purchases |
| POST | /api/orders/purchases | Create new purchase |
| DELETE | /api/orders/purchases | Delete purchase |

### Finance API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/finances/customer-transactions | List all customer transactions |
| POST | /api/finances/customer-transactions | Add customer transaction |
| GET | /api/finances/vendor-transactions | List all vendor transactions |
| POST | /api/finances/vendor-transactions | Add vendor transaction |
| DELETE | /api/finances/clear | Clear ledger |

### Dashboard API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Get dashboard statistics |

## 5.3 Sample API Implementation

### Inventory POST (src/app/api/inventory/route.ts)
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        category: body.category,
        length: parseFloat(body.length),
        width: parseFloat(body.width),
        gsm: parseInt(body.gsm),
        quantity: parseInt(body.quantity),
        unit: body.unit,
        lowStockThreshold: parseInt(body.lowStockThreshold) || 10,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
```

## 5.4 Form Design

### Inventory Add/Edit Form
- **Fields:** Name, Category (dropdown), Length, Width, GSM, Quantity, Unit (auto), Low Stock Threshold
- **Validation:** Required fields marked, number validation

### Customer Add/Edit Form
- **Fields:** Name, Email, Phone, Address
- **Validation:** Email format, phone format

### Order Create Form
- **Fields:** Customer (dropdown), Items (dynamic), Payment Amount, Payment Mode, Reference
- **Features:** Auto-calculate total, inventory item picker

---

# Lab 06: Implementing Interfaces

## 6.1 Technology Stack for UI

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Date Formatting | date-fns |

## 6.2 Project Structure

```
src/app/
├── page.tsx              # Landing page
├── layout.tsx            # Root layout with navigation
├── globals.css           # Global styles
├── dashboard/
│   └── page.tsx         # Dashboard
├── inventory/
│   └── page.tsx         # Inventory management
├── customers/
│   └── page.tsx         # Customer management
├── orders/
│   └── page.tsx         # Order management
├── vendors/
│   └── page.tsx         # Vendor management
└── finances/
    └── page.tsx         # Financial ledger
```

## 6.3 Design System

### Color Theme
- **Primary:** Emerald Green (#10b981)
- **Background:** White (#ffffff)
- **Text:** Gray shades (#1f2937, #4b5563, #6b7280)
- **Accent Colors:**
  - Blue for customers
  - Orange for vendors
  - Purple for orders

### UI Components
- **Buttons:** Primary (green bg), Secondary (outline), Danger (red)
- **Cards:** White with shadow, rounded corners
- **Tables:** Clean layout with hover states
- **Forms:** Input fields with labels
- **Modals:** Centered overlays with close button

## 6.4 Key Pages

### Dashboard Page
- Summary cards (clickable to navigate)
- Statistics display
- Low stock alerts
- Recent orders

### Inventory Page
- Table view of all items
- Add/Edit modal forms
- Low stock indicators (alert icon)
- Delete confirmation

### Customer Page
- Card-based customer list
- Expandable details
- Amount due display with color coding
- Ledger modal
- Payment modal

### Order Page
- Order table with filters (status, payment)
- Create order modal
- Order details modal
- Actions: Deliver, Cancel, Pay, Delete

### Vendor Page
- Vendor cards
- Purchase creation
- Ledger modal
- Payment modal

### Finances Page
- Tab-based view (Customers/Vendors)
- Transaction table
- Add transaction form
- Print and Clear buttons

---

# Lab 07: Business Logic Layer (BLL)

## 7.1 Business Logic Overview

The BLL is implemented in the API routes and handles all business rules.

## 7.2 Price Calculation Logic

### Formula Implementation

```typescript
const calculatePrice = (category: string, length: number, width: number, gsm: number, qty: number, rate: number): number => {
  if (category === 'Sheets') {
    return qty * rate;  // Rate per Sheet × Quantity
  } else if (gsm <= 199) {
    // Paper: Length × Width × GSM × Quantity × Rate ÷ 3100
    return (length * width * gsm * qty * rate) / 3100;
  } else {
    // Card: Length × Width × GSM × Quantity × Rate ÷ 15500
    return (length * width * gsm * qty * rate) / 15500;
  }
};
```

### Price Calculation Table

| Category | GSM | Formula |
|----------|-----|---------|
| Paper | ≤ 199 | L × W × GSM × Qty × Rate ÷ 3100 |
| Card | ≥ 200 | L × W × GSM × Qty × Rate ÷ 15500 |
| Sheets | Any | Rate per Sheet × Quantity |

## 7.3 Order Creation Logic

```typescript
// In POST /api/orders
const order = await prisma.$transaction(async (tx) => {
  // 1. Create order record
  const newOrder = await tx.order.create({
    data: { customerId, totalAmount, paidAmount, status, paymentStatus }
  });

  // 2. Create order items
  for (const item of items) {
    await tx.orderItem.create({ data: { ...item, orderId: newOrder.id }});
    
    // 3. Decrement inventory if linked
    if (item.inventoryItemId) {
      await tx.inventoryItem.update({
        where: { id: item.inventoryItemId },
        data: { quantity: { decrement: parseInt(item.quantity) }}
      });
    }
  }

  // 4. Create debit transaction
  const lastBalance = customer.transactions[0]?.balance || 0;
  const balanceAfterOrder = lastBalance + parseFloat(totalAmount);
  await tx.customerTransaction.create({
    data: {
      customerId, type: 'debit', amount: totalAmount,
      description: `Order #${newOrder.id.slice(-6)}`, balance: balanceAfterOrder
    }
  });

  // 5. Create credit transaction if payment made
  if (parseFloat(paidAmount) > 0) {
    const finalBalance = balanceAfterOrder - parseFloat(paidAmount);
    await tx.customerTransaction.create({
      data: {
        customerId, type: 'credit', amount: paidAmount,
        description: `Payment received for Order #${newOrder.id.slice(-6)}`,
        paymentMode, reference, balance: finalBalance
      }
    });
  }

  return newOrder;
});
```

## 7.4 Order Cancellation Logic

```typescript
// In PATCH /api/orders/[id] with cancelOrder: true
await prisma.$transaction(async (tx) => {
  // 1. Create credit to reverse the original debit
  await tx.customerTransaction.create({
    data: {
      customerId: order.customerId,
      type: 'credit',
      amount: order.totalAmount,
      description: `Order #${id.slice(-6)} Cancelled`,
      balance: lastBalance - order.totalAmount,
    }
  });

  // 2. Create debit for payment refund (if any)
  if (order.paidAmount > 0) {
    await tx.customerTransaction.create({
      data: {
        customerId: order.customerId,
        type: 'debit',
        amount: order.paidAmount,
        description: `Payment Refund for Cancelled Order #${id.slice(-6)}`,
        balance: lastBalance,
      }
    });
  }

  // 3. Restore inventory
  for (const item of order.items) {
    if (item.inventoryItemId) {
      await tx.inventoryItem.update({
        where: { id: item.inventoryItemId },
        data: { quantity: { increment: item.quantity }}
      });
    }
  }

  // 4. Mark order as cancelled
  await tx.order.update({
    where: { id },
    data: { isCancelled: true, status: 'cancelled', paymentStatus: 'refunded' }
  });
});
```

## 7.5 Customer Deletion Logic

- Cascades to orders (with ledger reversal)
- Cascades to transactions

---

# Lab 08: Run and Test – Verification and Validation

## 8.1 Running the Application

### Prerequisites
- Node.js 18+
- npm

### Commands

```bash
# Install dependencies
npm install

# Setup database
npx prisma db push
npx prisma generate

# Start development server
npm run dev

# Access at http://localhost:3000
```

## 8.2 Testing Checklist

### Functional Tests

| Feature | Test Case | Expected Result |
|---------|-----------|-----------------|
| Dashboard | Load dashboard | Statistics display correctly |
| Inventory | Add new item | Item appears in list |
| Inventory | Edit item | Changes saved |
| Inventory | Delete item | Item removed from list |
| Customer | Add customer | Customer appears in list |
| Customer | View ledger | Transactions displayed |
| Customer | Add payment | Balance updated |
| Customer | Delete customer | Customer + orders + transactions deleted |
| Order | Create order | Order created, inventory decremented, ledger updated |
| Order | Mark delivered | Status changed |
| Order | Cancel order | Ledger reversed, inventory restored |
| Order | Delete order | All reversed, order removed |
| Vendor | Add vendor | Vendor appears in list |
| Vendor | Create purchase | Purchase created, inventory updated |
| Finances | Add transaction | Transaction appears in ledger |
| Finances | Print ledger | Print dialog opens |
| Finances | Clear ledger | All transactions deleted |

### Visual Checkpoints

1. **Dashboard:** Green theme, clickable cards, stats displayed
2. **Inventory:** Table with low stock alerts
3. **Customers:** Card layout, amount due color coding
4. **Orders:** Status badges, action buttons
5. **Finances:** Tab navigation, transaction table

## 8.3 Error Handling Tests

| Scenario | Test | Expected Behavior |
|----------|------|-------------------|
| Empty fields | Submit form without required fields | Validation error message |
| API failure | Database connection error | Error message displayed |
| Invalid data | Invalid number input | Handled gracefully |

---

# Lab 09: Shopping Module Creation

## 9.1 Order Management as Shopping Module

The shopping module is implemented through the Order Management system.

## 9.2 Features Implemented

### Create Order
- Select customer from dropdown
- Add items from inventory OR create custom items
- Auto-calculate price using formula
- Enter payment amount during order
- Select payment mode (Cash, Bank, Cheque, Card)
- Add reference/notes

### Order Items
- Select from existing inventory items
- Manual/custom item entry
- Item details: Name, Category, Dimensions, GSM, Quantity, Rate
- Auto unit adjustment based on category

### Order Status Flow
```
Pending → Delivered
Pending → Cancelled
```

### Payment Status Flow
```
Unpaid → Paid
Unpaid → Refunded (on cancellation)
```

## 9.3 Key Screens

### New Order Modal
- Customer selection dropdown
- Inventory items list (clickable to add)
- Order items list (editable)
- Total amount display
- Payment section
- Submit/Cancel buttons

### Order Details Modal
- Order ID, Customer, Date
- Items table with all details
- Total, Paid, Balance display
- Payment status badge

---

# Lab 10: Payment Module Creation

## 10.1 Payment Features

### Order Payment
- Add payment to pending orders
- Payment modes: Cash, Bank Transfer, Cheque, Card
- Reference field for transaction ID
- Updates payment status automatically
- Creates credit transaction in customer ledger

### Customer Payment
- Add payment directly to customer account
- Same payment modes as order payment
- Updates customer ledger balance

### Vendor Payment
- Add payment to vendor account
- Payment modes: Cash, Bank Transfer, Cheque
- Updates vendor ledger balance

## 10.2 Payment API

```typescript
// POST /api/customers/[id]/payments
{
  amount: "5000",
  paymentMode: "cash",
  reference: "TXN123",
  description: "Payment received"
}
```

## 10.3 Ledger Impact

### Customer Payment
- Creates credit transaction in customer ledger
- Reduces customer balance

### Vendor Payment
- Creates debit transaction in vendor ledger
- Reduces vendor balance due

---

# Lab 11: Admin Panel and Reporting Interface

## 11.1 Dashboard (Admin Panel)

### Statistics Display
- Total Inventory Items (clickable to inventory)
- Total Customers (clickable to customers)
- Total Vendors (clickable to vendors)
- Total Orders (clickable to orders)

### Business Metrics
- Total Stock Value
- Outstanding Credits (customer dues)
- Total Sales
- Vendor Dues

### Alerts
- Low stock items list
- Recent orders (last 5)

## 11.2 Reporting Features

### Financial Reports
- Customer ledger with all transactions
- Vendor ledger with all transactions
- Filter by transaction type (debit/credit)

### Report Features
- Print functionality for all ledgers
- Clear ledger option (with confirmation)
- Date display on transactions
- Running balance

## 11.3 Admin Actions

| Action | Location | Description |
|--------|----------|-------------|
| Manage Inventory | Inventory Page | Add/Edit/Delete items |
| Manage Customers | Customer Page | Full CRUD operations |
| Manage Orders | Order Page | Create/View/Cancel/Delete |
| Manage Vendors | Vendor Page | Full CRUD operations |
| View Reports | Finances Page | Customer & Vendor ledgers |
| System Overview | Dashboard | All statistics |

---

# APPENDIX A: Key Features Summary

| Feature | Implemented |
|---------|-------------|
| Dashboard with stats | ✓ |
| Inventory Management | ✓ |
| Customer Management | ✓ |
| Order Management | ✓ |
| Vendor Management | ✓ |
| Financial Ledger | ✓ |
| Price Calculation | ✓ |
| Low Stock Alerts | ✓ |
| Print Functionality | ✓ |
| Order Cancellation | ✓ |
| Ledger Clearing | ✓ |
| Payment Tracking | ✓ |
| PKR Currency | ✓ |
| Green/White Theme | ✓ |

---

# APPENDIX B: Database Schema Summary

**9 Tables:**
1. InventoryItem
2. Customer
3. Vendor
4. Order
5. OrderItem
6. Purchase
7. PurchaseItem
8. CustomerTransaction
9. VendorTransaction

---

# APPENDIX C: API Summary

**25+ API Endpoints** covering all CRUD operations for all entities.

---

*Document prepared for SQA Lab Manual Submission*
*Project: Sunshine Paper Store (Local Paper Merchant)*
*Technology: Next.js, React, TypeScript, Prisma, SQLite, Tailwind CSS*
