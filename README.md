# PayKit Frontend

React frontend for the [PayKit](https://github.com/shivamgupta88/paykit) multi-tenant invoicing and payment platform.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** — build tool
- **Tailwind CSS v4** — utility-first styling
- **React Router v7** — client-side routing
- **Axios** — HTTP client with JWT interceptor

## Features

| Module | Description |
|---|---|
| Landing Page | Hero, feature cards, how-it-works, CTA |
| Auth | 2-step workspace + account registration, login |
| Dashboard | Revenue stats, recent invoices, shimmer loading |
| Customers | List, search, create, edit, delete |
| Invoices | List with status tabs, create with dynamic line items |
| Invoice Detail | Document view, status transitions, PDF download |
| Payments | Razorpay collection, payment history |

## Getting Started

### Prerequisites

- Node.js 18+
- PayKit backend running (see [backend repo](https://github.com/shivamgupta88/paykit))

### Setup

```bash
# Clone
git clone https://github.com/shivamgupta88/paykit-frontend.git
cd paykit-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — set VITE_API_URL to your backend URL

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | PayKit backend base URL | `http://localhost:8080` |

### Build for Production

```bash
npm run build
# Output in dist/
```

## Project Structure

```
src/
├── api/                   # Axios API clients
│   ├── client.ts          # Base instance + JWT interceptor
│   ├── auth.ts            # Register, login, tenant
│   ├── customers.ts       # Customer CRUD
│   ├── invoices.ts        # Invoice CRUD + PDF download
│   └── payments.ts        # Razorpay initiate + verify
├── components/
│   ├── AppShell.tsx       # Sidebar layout for dashboard
│   └── ProtectedRoute.tsx # Auth guard
├── context/
│   └── AuthContext.tsx    # JWT + localStorage auth state
└── pages/
    ├── LandingPage.tsx
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── DashboardPage.tsx
    ├── CustomersPage.tsx
    ├── InvoicesPage.tsx
    ├── CreateInvoicePage.tsx
    ├── InvoiceDetailPage.tsx
    └── PaymentsPage.tsx
```

## Backend

Spring Boot 3.2 + Java 21 with multi-tenancy, JWT auth, PostgreSQL, Redis, Razorpay, iText 8 PDF, and AES-256 encryption.

See the [backend repository](https://github.com/shivamgupta88/paykit) for setup instructions.
