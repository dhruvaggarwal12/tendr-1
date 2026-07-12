


# Tendr — We Curate, You Celebrate

> Event planning in India is fragmented, stressful, and full of unreliable vendors. **Tendr** fixes that. It's a curated event planning marketplace for Delhi NCR that connects people with verified photographers, caterers, decorators, DJs, and more — all in one place.

**Live:** [tendr-one.vercel.app](https://tendr-one.vercel.app) &nbsp;|&nbsp; **WhatsApp:** +91-9211668427 &nbsp;|&nbsp; **Email:** contacttendr@gmail.com

---

## The Problem Tendr Solves

Planning an event traditionally means calling 10+ vendors separately, no price transparency, no reviews, and wasting days on logistics. **Tendr curates everything in one platform** — verified vendors, smart planning tools, and direct booking. You celebrate, we curate.

---

## Who Is Tendr For?

**Customers** — People planning birthdays, weddings, corporate events, family gatherings, ring ceremonies. They discover vendors, plan their event, and book everything in one place.

**Vendors** — Photographers, caterers, decorators, DJs based in Delhi NCR who want a steady stream of verified bookings.

**Admins** — The Tendr team who manage vendor verification, booking oversight, and platform operations.

---

## Booking Flows

Tendr offers two distinct paths after the event planning form:

### Flow A — You Do It
Browse and choose vendors yourself.
```
Fill event form → Select service categories → Browse vendor listings
→ Add to compare → Chat with vendors → Finalise vendors → Review & Book
```

### Flow B — Let Us Do It (Concierge)
Tell us your needs, Tendr handles the rest.
```
Fill event form → Select service categories → Chat with Tendr team
→ Tendr recommends & executes → Review & confirm
```

Both flows start with the same multi-step event planning form. The user picks their path from the **Choose Booking** screen (`/booking`).

---

## Features

### Homepage (`/`)
- Scroll-aware sticky navbar with animated dropdowns
- Full-screen hero slideshow with CTA
- Top Rated Vendors carousel by category
- Corporate Event Planning section
- Events Gallery
- Platform journey flow explainer
- Footer with full navigation + social links

### Event Planning Form (`/plan-event/form`)
- Multi-step question-by-question form (event name, type, guests, budget, location, date, additional info)
- Progress bar across 7 steps
- Redux-persisted form state (session-scoped, clears on fresh start)
- Service category selection screen (Photography, Catering, DJ, Decoration) with live vendor counts
- "Need anything else?" textarea with example placeholder

### Vendor Listings (`/listings`)
- Real-time vendor cards fetched from backend
- Filters: service type, city (Delhi / Noida / Greater Noida / Ghaziabad), date, guest count
- Add to Compare (max 4 vendors)
- Sticky filter bar
- Scroll-to-top on mount

### Vendor Details (`/vendor/:id`)
- Full vendor profile: gallery, description, services, pricing
- "Chat with Vendor" button
- "Add to Compare / Added to Compare" toggle

### Compare Modal
- Side-by-side comparison of up to 4 selected vendors
- Grouped by service category
- Accessible from ListingsNav "Selected Vendors" button or Chat subheader

### Chat (`/chat`)
- Real-time messaging with vendor or Tendr concierge via Socket.io
- Image attachments (up to 10, 10MB each)
- "Finalise Vendor" button in the input bar
- "Selected Vendors (N)" pill in vendor subheader row (you-do-it flow)
- Booking details header strip
- You-do-it: full selected/finalised vendor controls
- Let-us-do-it: hides vendor selection UI, shows concierge profile

### Booking Review Page (`/booking/review`)
- Reads all state from Redux (no prop drilling)
- Event details section
- Accordion vendor cards (one per finalised service category)
- Seed-deterministic pricing per vendor
- Additional requirements block
- You-do-it: shows actual vendor name + details
- Let-us-do-it: shows "Tendr" / Concierge Planning branding
- Navbar: no Selected Vendors, no Finalised Vendors, no title

### Auth (`/login`)
- Split-screen layout (photo panel left, form right)
- Sign In / Sign Up toggle
- Password visibility toggle
- Location dropdown (Delhi / Noida / Greater Noida / Ghaziabad)
- Gold gradient CTA

### Admin Dashboard (`/admin/dashboard`)
- Vendor management table
- Charts: bookings by city, vendor category distribution, monthly revenue
- Cities: Delhi, Noida, Greater Noida, Ghaziabad

### Planning Tools
| Tool | Route |
|---|---|
| Event Checklist | `/checklist` |
| Timeline Planner | `/timeline-picker` |
| Budget Allocator | `/budget-allocator` |
| Aftermovie | `/aftermovie` |
| Invitation Flyers | `/invitation` |

Accessible from the SpeedDial FAB on all planning pages.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 |
| Routing | React Router DOM v6 |
| State management | Redux Toolkit (`listingFiltersSlice`, `eventPlanningSlice`, `authSlice`) |
| Styling | Inline styles + Tailwind CSS |
| UI components | Material UI (SpeedDial, icons) |
| Icons | Lucide React, React Icons |
| Animation | Framer Motion |
| Real-time | Socket.io client |
| Build tool | Vite |
| Deployment | Vercel |
| Backend | Node.js / Express — `https://tendr-backend-75ag.onrender.com` |

---

## State Management

Redux store has three slices:

### `listingFiltersSlice`
| Key | Storage | Description |
|---|---|---|
| `compareSelected` | `sessionStorage` | Vendors added to compare — per-tab, clears on tab close |
| `finalisedVendors` | `sessionStorage` | Object keyed by serviceType — per-tab |
| `eventType`, `serviceType`, `locationType`, `date`, `guestCount` | `localStorage` | Active listing filters |

### `eventPlanningSlice`
| Key | Storage | Description |
|---|---|---|
| `formData` | In-memory only | Event form fields — always starts blank |
| `bookingType` | In-memory | `"you-do-it"` or `"let-us-do-it"` |
| `currentStep` | In-memory | Active form step index |
| `showVendorScreen` | In-memory | Whether service category screen is shown |
| `selectedVendors` | In-memory | Service categories the user has ticked |

### `authSlice`
Handles user login/logout and current user profile.

**Session isolation:** `compareSelected` and `finalisedVendors` use `sessionStorage` — each browser tab is independent. Opening a new tab does not copy another tab's vendor selections.

**Fresh start:** `resetEventPlanning()` clears both `localStorage` (formData) and returns a blank state object — does not restore any previous data.

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Deep Brown | `#2C1A0E` | Headings, primary text |
| Mid Brown | `#3B2F2F` | Body text |
| Gold | `#C47A2E` | Primary CTA, accents |
| Gold Light | `#CCAB4A` | Gradient endpoint, badges |
| Warm Tan | `#9B7450` | Secondary text, captions |
| Cream BG | `#FFFCF5` | Card backgrounds |
| Page BG | `#F8F4EF` | Page/section backgrounds |
| Font | Outfit (Google Fonts) | All UI text |

---

## Project Structure

```
tendr-1/
├── src/
│   ├── assets/
│   │   ├── logos/
│   │   └── ui/
│   ├── apis/
│   │   └── vendorApi.js                 # API calls to backend
│   ├── components/
│   │   ├── Navbar.jsx                   # Home page navbar (fixed, scroll-aware)
│   │   ├── ListingsNav.jsx              # Sticky nav for listing/chat/review pages
│   │   ├── FilterBar.jsx                # Listing page filter controls
│   │   ├── CompareModal.jsx             # Side-by-side vendor compare
│   │   ├── SelectedVendorsFloat.jsx     # Floating "Selected N" button (home/form)
│   │   ├── BasicSpeedDial.jsx           # FAB for planning tools
│   │   ├── Footer.jsx                   # Site-wide footer
│   │   ├── EventFormSummary.jsx         # Summary strip on service category screen
│   │   └── ...
│   ├── pages/
│   │   ├── Home/
│   │   │   └── Home.jsx
│   │   ├── customer/
│   │   │   ├── Auth.jsx                 # Sign in / Sign up (split-screen)
│   │   │   ├── ChooseBooking.jsx        # Pick You Do It vs Let Us Do It
│   │   │   ├── EventPlanning.jsx        # Multi-step form + service category screen
│   │   │   ├── VendorList.jsx           # Listings page
│   │   │   ├── VendorDetails.jsx        # Vendor profile
│   │   │   └── Chat.jsx                 # Vendor / concierge chat
│   │   ├── booking/
│   │   │   └── BookingReviewPage.jsx    # Final review & book
│   │   └── admin/
│   │       └── Dashboard.jsx
│   ├── redux/
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   ├── listingFiltersSlice.js       # compareSelected, finalisedVendors, filters
│   │   └── eventPlanningSlice.js        # Form data, booking type, step
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
└── vercel.json
```

---

## Full Route Map

| Route | Page | Access |
|---|---|---|
| `/` | Homepage | Public |
| `/login` | Sign In / Sign Up | Public |
| `/booking` | Choose booking flow | Auth |
| `/plan-event/form` | Event planning form | Auth |
| `/listings` | Vendor listings | Auth |
| `/vendor/:id` | Vendor profile | Auth |
| `/chat` | Vendor / concierge chat | Auth |
| `/booking/review` | Review & Book | Auth |
| `/checklist` | Event Checklist | Public |
| `/timeline-picker` | Timeline Planner | Public |
| `/budget-allocator` | Budget Allocator | Public |
| `/aftermovie` | Aftermovie Tool | Public |
| `/invitation` | Invitation Builder | Public |
| `/gift-hampers-cakes` | Gift Hampers & Cakes | Public |
| `/vendor/register` | Vendor Registration | Public |
| `/dashboard` | Customer Dashboard | Auth |
| `/admin/dashboard` | Admin Panel | Admin only |

---

## Backend

**Base URL:** `https://tendr-backend-75ag.onrender.com`

Key endpoints currently used by the frontend:

| Method | Path | Used by |
|---|---|---|
| `GET` | `/vendors` | VendorList — fetch vendors with filters |
| `GET` | `/vendors/:id` | VendorDetails — single vendor profile |
| `POST` | `/auth/login` | Auth — sign in |
| `POST` | `/auth/register` | Auth — sign up |
| WebSocket | `/` | Chat — Socket.io real-time messaging |

Socket.io events:
| Event | Direction | Payload |
|---|---|---|
| `open_conversation` | Client → Server | `{ requestId, chatType, userId }` |
| `conversation_opened` | Server → Client | `{ _id }` (conversation id) |

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
git clone https://github.com/dhruvaggarwal12/tendr-1.git
cd tendr-1
npm install
npm run dev
# → http://localhost:5173
```

### Commands

```bash
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
```

---

## Deployment

Deployed on **Vercel**. Auto-deploys on push to `main`.

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

---

## Contact

| Channel | Details |
|---|---|
| Email | contacttendr@gmail.com |
| WhatsApp | +91-9211668427 |
| Location | Delhi NCR, India |
| Website | [tendr-one.vercel.app](https://tendr-one.vercel.app) |

---

*All rights reserved © 2025 Tendr. Proprietary — do not redistribute without permission.*
