# Sunshine Paper Store - Local Paper Merchant Management System

A comprehensive inventory and order management system for a local paper merchant business. Built with Next.js, Prisma, and SQLite.

## Features

- **Dashboard** - Business overview with statistics, low stock alerts, recent orders
- **Inventory Management** - Track paper and card products with GSM, dimensions, quantities
- **Customer Management** - Customer profiles with ledger tracking and payments
- **Order Management** - Create orders with auto price calculation, cancel, and track
- **Vendor Management** - Vendor profiles, purchases, and ledger
- **Financial Ledger** - Complete debit/credit tracking for customers and vendors

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite |
| ORM | Prisma 5.22 |
| Icons | Lucide React |

## Getting Started

```bash
npm install
npx prisma db push
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Price Calculation

| Category | GSM | Formula |
|----------|-----|---------|
| Paper | ≤ 199 | L × W × GSM × Qty × Rate ÷ 3100 |
| Card | ≥ 200 | L × W × GSM × Qty × Rate ÷ 15500 |
| Sheets | Any | Rate per Sheet × Quantity |

## API Endpoints

- `/api/inventory` - CRUD for inventory items
- `/api/customers` - CRUD for customers
- `/api/orders` - CRUD for orders
- `/api/vendors` - CRUD for vendors
- `/api/orders/purchases` - CRUD for purchases
- `/api/finances/*` - Ledger transactions
- `/api/dashboard` - Dashboard statistics

## Deploy

```bash
npm run build
npm start
```
