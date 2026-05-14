# PayKit Frontend

React SPA for the PayKit invoicing platform. Handles workspace management, customer records, invoice creation, payment collection via Razorpay, and wallet withdrawals.

Built with React 19, TypeScript, Vite.

---

## Setup

```bash
npm install
npm run dev        # dev server on localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build
```

Create a `.env.local` for the backend URL:

```
VITE_API_URL=http://localhost:8080
```

Backend repo: [paykit](https://github.com/shivamgupta88/paykit)

---

## Project structure

```
src/
|
+-- api/
|   +-- client.ts              # axios instance, JWT interceptor, 401 redirect
|   +-- auth.ts                # register, login, tenant lookup
|   +-- customers.ts           # customer CRUD
|   +-- invoices.ts            # invoice CRUD, status transitions, PDF download
|   +-- payments.ts            # razorpay initiate + verify
|   +-- wallet.ts              # balance, withdraw, payout history
|
+-- components/
|   +-- AppShell.tsx            # sidebar layout — nav, user profile, logout
|   +-- ProtectedRoute.tsx      # redirects to /login if no token
|
+-- context/
|   +-- AuthContext.tsx          # user state, token persistence in localStorage
|   +-- ToastContext.tsx         # toast notifications (success/error/info), 3.5s auto-dismiss
|
+-- pages/
|   +-- LandingPage.tsx          # marketing page, feature cards, CTA
|   +-- RegisterPage.tsx         # 2-step: create workspace → create account
|   +-- LoginPage.tsx            # workspace slug + credentials
|   +-- DashboardPage.tsx        # revenue stats, recent invoices, overdue alerts
|   +-- CustomersPage.tsx        # table with search, add/edit modal, CSV export
|   +-- InvoicesPage.tsx         # status tabs, search, customer name resolution, CSV export
|   +-- CreateInvoicePage.tsx    # line items editor, tax calc, live total sidebar
|   +-- InvoiceDetailPage.tsx    # document view, status actions, PDF download
|   +-- PaymentsPage.tsx         # awaiting payments, copy link, paid history with details
|   +-- WalletPage.tsx           # balance cards, bank/UPI withdraw form, payout history
|   +-- PublicPaymentPage.tsx    # customer-facing payment (no auth, plain axios)
|
+-- App.tsx                      # routes
+-- main.tsx                     # entry point
+-- index.css                    # tailwind import, animations, responsive breakpoints
```

---

## Routes

### Public (no login needed)

| Path | Page | What it does |
|---|---|---|
| `/` | LandingPage | product overview, signup CTA |
| `/register` | RegisterPage | workspace + account creation |
| `/login` | LoginPage | sign in with workspace slug |
| `/pay/:invoiceId` | PublicPaymentPage | customer pays invoice via Razorpay |

### Protected (JWT required, sidebar layout)

| Path | Page | What it does |
|---|---|---|
| `/dashboard` | DashboardPage | stats cards, recent invoices |
| `/customers` | CustomersPage | CRUD, search, CSV export |
| `/invoices` | InvoicesPage | list with status tabs |
| `/invoices/new` | CreateInvoicePage | create invoice with line items |
| `/invoices/:id` | InvoiceDetailPage | view, status change, PDF |
| `/payments` | PaymentsPage | copy payment link, track collections |
| `/wallet` | WalletPage | balance, withdraw to bank/UPI |

---

## Auth flow

```
RegisterPage                          LoginPage
  |                                     |
  +-- POST /api/tenants                 +-- GET /api/tenants/{slug}
  |   (create workspace)                |   (resolve tenantId)
  |                                     |
  +-- POST /api/auth/register           +-- POST /api/auth/login
  |   (create user, get JWT)            |   (verify creds, get JWT)
  |                                     |
  +-- AuthContext.login()               +-- AuthContext.login()
  |   stores token + tenantId           |   stores token + tenantId
  |   in localStorage                   |   in localStorage
  |                                     |
  +-- redirect /dashboard              +-- redirect /dashboard
```

Every API call after login attaches `Authorization: Bearer <token>` via axios interceptor. On 401 response, token is cleared and user is redirected to `/login`.

---

## Payment collection flow

Owner doesn't pay their own invoices. Instead:

```
1. Owner creates invoice, marks SENT
2. Owner goes to Payments page
3. Clicks "Copy Payment Link" → copies /pay/{invoiceId}
4. Sends link to customer (email, whatsapp, etc.)
5. Customer opens link → sees invoice details
6. Customer clicks "Pay Now" → Razorpay checkout opens
7. Customer pays → signature verified → invoice marked PAID
8. Owner's wallet gets credited (minus 2% platform fee)
```

PublicPaymentPage uses plain `axios` instead of `apiClient` — no JWT needed, no 401 redirect.

---

## API layer

`src/api/client.ts` sets up a shared axios instance:

```
Base URL:  VITE_API_URL env var

Request interceptor:
  → attaches Bearer token from localStorage

Response interceptor:
  → on 401: clear localStorage, redirect to /login
```

All API modules (`auth.ts`, `customers.ts`, etc.) import this shared instance. Exception: `PublicPaymentPage.tsx` uses raw axios for unauthenticated calls.

---

## State management

No Redux or Zustand. Just React Context:

- **AuthContext** — user session (token, tenantId, email, workspaceName). Persisted in localStorage across page reloads.
- **ToastContext** — transient notifications. `toast('message', 'success')` from any component.

Page-level state is local `useState`. No global store for business data — each page fetches what it needs on mount.

---

## Styling

Inline `style` objects on every element. No CSS classes, no Tailwind utilities, no CSS modules.

Color system:

```
Primary:     #4f46e5  (indigo)
Accent:      #818cf8  (light indigo)
Success:     #059669  (green)
Error:       #dc2626  (red)
Warning:     #f59e0b  (amber)
Dark bg:     #0f172a  (sidebar)
Light bg:    #f8fafc  (page background)
Text dark:   #0f172a
Text muted:  #64748b, #94a3b8
Border:      #e2e8f0
```

Skeleton loading states use CSS `@keyframes shimmer` for loading placeholders.

---

## Responsive

Sidebar layout switches at `1024px`:

- **Desktop**: fixed 232px dark sidebar + content area
- **Mobile**: sidebar hidden, hamburger menu in top bar, overlay sidebar on tap

Defined in `index.css` media queries:
```css
@media (max-width: 1023px)  → hide desktop sidebar, show mobile topbar
@media (min-width: 1024px)  → show sidebar, hide mobile topbar
```

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | 19.x | UI library |
| react-dom | 19.x | DOM rendering |
| react-router-dom | 7.x | client-side routing |
| axios | 1.x | HTTP client |
| vite | 8.x | dev server + bundler |
| typescript | 6.x | type checking |
| tailwindcss | 4.x | base styles |

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | backend API base URL |

Set in `.env.local` for local dev, or in Netlify/Vercel dashboard for deployment.

---

## Build & deploy

```bash
npm run build
```

Output goes to `dist/`. Deploy to any static hosting:

- **Netlify**: build command `npm run build`, publish dir `dist`
- **Vercel**: auto-detected as Vite project

SPA routing — hosting needs to serve `index.html` for all paths (Netlify and Vercel handle this automatically).

---

## Backend

Spring Boot 3.2 + Java 21 — multi-tenancy, JWT auth, PostgreSQL, Redis, Razorpay integration, AES-256 encryption for PII, Flyway migrations, wallet + payout system.

See [backend repo](https://github.com/shivamgupta88/paykit) for setup and architecture docs.
