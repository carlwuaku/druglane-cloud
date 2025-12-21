# Druglane Cloud UI Structure - Complete Documentation

## Overview
The Druglane Cloud application is built with Angular 20+ using standalone components and Material Design. It's a responsive, modern pharmacy management system with role-based access (Admin and Company Users).

---

## 1. THEME & STYLING SYSTEM

### Color Scheme
**Primary Palette:**
- Primary Green: `#1b5e20`, `#2e7d32`, `#43a047` (Material Green Palette)
- Secondary Blues: `#1976d2`, `#2196f3`
- Accent Orange: `#ff9800`, `#f57c00`
- Red/Danger: `#d32f2f`, `#f44336`
- Teal: `#00897b`, `#009688`
- Purple: `#7b1fa2`, `#9c27b0`

**Sidebar Theme:**
- Background: `#1e1e2d` (dark)
- Profile Header: Gradient `#2d7a3e` to `#1b5e20`
- Text: White (`#ffffff`)

**General Backgrounds:**
- Card/Surface: `#ffffff`
- Page Background: `#f5f5f5`
- Light Background: `#fbead5`, `#f7f7f7`

### Typography
```scss
// Font Stack
Font Family: Lato, sans-serif (body)
Headings Font: Montserrat, sans-serif

// Font Sizes
h1, h2, h3, h4, h5: 700 weight, Montserrat
Body: 14px, 400 weight
Large Text: 20px
UI Components: Various sizes (6.875rem - 1.75rem)
```

### Spacing Patterns
- Page Padding: `16px` (desktop), `12px` (mobile)
- Component Gaps: `4px` - `24px` (varies by component)
- Card Padding: `16px` - `24px`
- Sidebar padding: `24px 16px`

### Config Files
- **Global Styles:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/styles.scss`
- **Theme Tailwind:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/themes/_tailwind.css`
- **PostCSS Config:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/.postcssrc.json`

### CSS Framework
- **Angular Material 20.1.6:** Complete Material Design system
- **Tailwind CSS 4.1.3:** Utility-first CSS framework
- **SCSS:** Component-scoped styling with SCSS preprocessing

---

## 2. LAYOUT COMPONENTS

### App Root Layout
**File:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/app.component.ts`
**Template:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/app.component.html`
**Styles:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/app.component.scss`

**Structure:**
```
app-root
├── mat-toolbar (primary color, height: 64px)
│   ├── Menu toggle button
│   ├── Logo (50px height)
│   ├── App name
│   ├── Spacer
│   ├── User profile menu
│   └── Logout button
├── mat-sidenav-container
│   ├── mat-sidenav (width: 250px)
│   │   └── app-sidebar-nav
│   └── mat-sidenav-content
│       ├── Breadcrumb section
│       └── <router-outlet>
├── p-toast (notifications - top-right)
└── p-toast (loading indicator - top-right)
```

**Responsive Behavior:**
- Mobile: Sidenav mode = 'over' (overlays content)
- Desktop: Sidenav mode = 'side' (permanent)
- Breakpoint: 768px

### Navbar/Header Component
**Location:** Built-in within `app.component.ts`
**Height:** 64px (fixed at top)
**Color:** Material Primary (green #2e7d32)
**Elements:**
- Menu toggle (hamburger icon)
- Logo container (white background, rounded)
- App title/name (h1)
- Spacer (flex: 1)
- User dropdown menu
- Logout button

### Sidebar/Navigation Component
**File:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/sidebar-nav/sidebar-nav.component.ts`
**Template:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/sidebar-nav/sidebar-nav.component.html`
**Styles:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/sidebar-nav/sidebar-nav.component.scss`

**Structure:**
```
.sidebar-container
├── .user-profile-section
│   ├── Profile background image (opacity: 0.15)
│   ├── User avatar (64px circular)
│   ├── User name (h3)
│   ├── User role
│   └── Company name
└── .nav-menu
    ├── mat-expansion-panel (for menu items with submenu)
    │   ├── mat-expansion-panel-header
    │   └── submenu-container
    │       └── submenu-item (links/buttons)
    └── menu-item-simple (for direct links)
```

**Styling Details:**
- Sidebar Width: 250px
- Background: #1e1e2d (dark)
- Text Color: White with opacity levels
- Active Menu Item: Green background (rgba(45, 122, 62, 0.4)) with left border
- Hover Effects: rgba(255, 255, 255, 0.08) background
- Custom scrollbar styling

**Menu Structure:**
Admin Users:
- Dashboard (direct link)
- Companies (collapsible with actions: View All, Add New)
- Users (collapsible with actions: View All, Add New)

Company Users:
- Dashboard (direct link)
- Products (collapsible)
- Sales (collapsible: Summary, Details)
- Purchases (collapsible: Summary, Details)

---

## 3. DASHBOARD/HOME COMPONENTS

### Admin Dashboard
**File:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/home/home.component.ts`
**Template:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/home/home.component.html`
**Styles:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/home/home.component.scss`

**Sections:**
1. **Welcome Banner**
   - Gradient background (#1b5e20 to #2e7d32)
   - White text
   - User greeting with display name
   - White badge labels for info (company, role, date)

2. **Company Overview Stats** (4 columns)
   - Total Companies
   - Active Companies
   - Inactive Companies
   - Expired Companies

3. **License & User Management** (Expansion Panel)
   - Expiring Soon
   - Total Company Users
   - Recently Active Users
   - Inactive Users

4. **Database Backup Status** (Expansion Panel)
   - No Backup (Week)
   - No Backup (Month)
   - No Backup (Year)
   - Never Uploaded
   - Recent Uploads
   - Total Storage

### Company Dashboard
**File:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/company-dashboard/company-dashboard.component.ts`
**Template:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/company-dashboard/company-dashboard.component.html`

**Sections:**
1. **Welcome Banner** (Same as admin)

2. **Business Dashboard Header**
   - Title: "Business Dashboard"
   - Database status info box (last update, size)

3. **Quick Overview Stats** (4 columns)
   - Total Products
   - Today Sales (formatted with currency)
   - Today Purchases (formatted with currency)
   - Stock Value (total inventory value)

4. **Sales Performance** (Expansion Panel)
   - Period Sales (Current Month, This Week, Month Growth, Month Profit)
   - Top Performers (Highest by Value, Highest by Quantity)

5. **Purchase Performance** (Expansion Panel)
   - Period Purchases (Current Month, This Week, Month Growth, Avg Value)
   - Most Purchased Products

6. **Inventory Status** (Expansion Panel)
   - Out of Stock
   - Below Min Stock
   - Above Max Stock

7. **Product Expiry Status** (Expansion Panel)
   - Expired (In Stock)
   - Expiring This Month
   - Expiring Next Month

---

## 4. FEATURE MODULES

### 4.1 Products Module
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/products-list/`

**Component:** `ProductsListComponent`

**Template Structure:**
```html
<app-page-container>
  <mat-accordion> <!-- Statistics -->
    <mat-expansion-panel>
      <!-- Stock Value Stats (2 cards) -->
      <!-- Stock Levels Stats (3 cards) -->
      <!-- Product Expiry Stats (3 cards) -->
      <!-- Overview Stats (4 cards) -->
    </mat-expansion-panel>
  </mat-accordion>
  
  <app-load-data-list> <!-- Products table -->
  </app-load-data-list>
</app-page-container>
```

**Key Features:**
- Interactive stat cards with click-to-filter
- Visual ring highlight on active filter
- Clear filter button
- Expandable statistics section
- Data table with pagination, search, export
- Query params support: `stock_filter` parameter

---

### 4.2 Sales Module
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/sales-list/`
**Also:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/sales-details/`

**Component:** `SalesListComponent`

**Template Structure:**
```html
<app-page-container>
  <mat-accordion> <!-- Statistics -->
    <!-- Sales metrics displayed in grid -->
  </mat-accordion>
  
  <app-load-data-list> <!-- Sales table -->
  </app-load-data-list>
</app-page-container>
```

**Key Features:**
- Period-based sales statistics
- Date range filtering
- Top product tracking (by value and quantity)
- Sales growth rate calculation
- Formatted currency display
- Growth indicators (trending up/down)

---

### 4.3 Purchases Module
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/purchases-list/`
**Also:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/purchase-details/`

**Component:** `PurchasesListComponent`

**Similar structure to Sales module with purchase-specific stats**

---

### 4.4 Companies Module (Admin)
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/companies/pages/`

**Components:**
- `CompaniesListComponent` (list view)
- `CompanyFormComponent` (create/edit/view)

---

### 4.5 Users Module (Admin)
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/users/pages/`

**Components:**
- `UsersListComponent` (list view)
- `UserFormComponent` (create/edit/view)

---

## 5. KEY COMPONENTS LIBRARY

### 5.1 Stats Card Component
**File:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/stats-card/stats-card.component.ts`

**Purpose:** Displays metric cards with icon, count, title, and description

**Inputs:**
```typescript
title: string (required)
count: number | string (required)
icon: string (required) - Material icon name
description?: string
tooltip?: string - Info tooltip
url?: string - Navigation link
urlParams?: Params
iconBackgroundColor?: string (default: '#2e7d32')
loading?: boolean (default: false)
```

**Styling:**
- Card size: 100% flexible
- Icon container: 56-60px rounded square
- Hover effect: translateY(-4px), shadow increase
- Icon scale animation on hover
- Responsive text sizing
- Vertical centered layout

**Variants:**
With URL: renders as `<a routerLink>`
Without URL: renders as plain card

---

### 5.2 Load Data List Component
**File:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/load-data-list/load-data-list.component.ts`

**Purpose:** Generic data table loader with pagination, search, filtering, export

**Inputs:**
- `url: string` - API endpoint
- `limit: number` - Items per page
- `offset: number` - Starting position
- `showPagination: boolean`
- `showSearch: boolean`
- `showExport: boolean`
- `showActions: boolean`
- `rowSelection: 'single' | 'multiple'`
- `listTitleField: string` - Field to display in lists
- `emptyMessage: string`
- `preload: boolean` - Load on init

---

### 5.3 Table Component
**File:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/table/table.component.ts`

**Purpose:** Material data table with sorting, selection, inline editing

**Features:**
- Column customization
- Checkbox selection (single/multiple)
- Inline cell editing
- Custom cell renderers
- Responsive design
- Image support (via PrimeNG)

---

### 5.4 Page Container Component
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/page-container/`

**Purpose:** Wrapper for page content with consistent styling

**Template Structure:**
```html
<div class="page-container">
  <div class="page-header">
    {{pageTitle}}
  </div>
  <div class="page-content">
    <ng-content></ng-content>
  </div>
</div>
```

---

### 5.5 Alert Component
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/alert/`

**Purpose:** Display success, error, info, warning messages

**Input:**
- `type: AlertType` ('success' | 'error' | 'info' | 'warning')

---

### 5.6 Form Generator Component
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/form-generator/`

**Purpose:** Dynamic form creation from configuration

**Supported Field Types:**
- Text, Email, Password
- Number, Date, Date Range
- Select, Checkbox, Radio
- Textarea
- File Upload

---

## 6. ROUTING STRUCTURE

**Routes File:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/app.routes.ts`

**Route Map:**
```
'' (redirects to /dashboard)
/dashboard - Admin Dashboard (authGuard, userResolver, appSettingsResolver)
/company-dashboard - Company Dashboard (authGuard, userResolver, appSettingsResolver)

/login - Login page
/forgot-password - Forgot password
/reset-password - Reset password
/activate - License activation

/companies (authGuard, adminGuard)
  ├── '' - Companies list
  ├── /new - Create company
  ├── /:id - View company
  └── /:id/edit - Edit company

/users (authGuard, adminGuard)
  ├── '' - Users list
  ├── /new - Create user
  ├── /:id - View user
  └── /:id/edit - Edit user

/products (authGuard, companyUserGuard) - Products list
/sales (authGuard, companyUserGuard) - Sales summary
/sales-details (authGuard, companyUserGuard) - Detailed sales
/purchases (authGuard, companyUserGuard) - Purchase summary
/purchase-details (authGuard, companyUserGuard) - Detailed purchases
```

---

## 7. KEY STYLING/LAYOUT PATTERNS

### Card Styling Pattern
```scss
.card-style {
  background-color: white;
  border-radius: 12px; // (or 8px for smaller components)
  padding: 16px - 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}
```

### Grid Layout Pattern
```scss
// Responsive grids used throughout
grid-cols-1 // Mobile
md:grid-cols-2 // Tablet
lg:grid-cols-3 lg:grid-cols-4 // Desktop

gap: 4px to 24px
```

### Button Styling
```scss
height: 48px;
padding: 8px 16px;
border-radius: 8px;
font-weight: 500;
transition: all 0.2s ease;

&:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Text Hierarchy
- H1/H2/H3: Montserrat, 700, dark colors
- Body: Lato, 400, 14px, #333
- Labels: Bold, uppercase with letter-spacing
- Small text: reduced font size with opacity

### Expansion Panel Pattern
- Used for collapsible sections (statistics, filters)
- Header shows summary info
- Body contains detailed content
- Smooth expand/collapse animation

---

## 8. RESPONSIVE DESIGN BREAKPOINTS

**Tailwind Classes Used:**
- `grid-cols-1` - All devices
- `md:grid-cols-2` - Tablets (768px+)
- `lg:grid-cols-3`, `lg:grid-cols-4` - Desktops (1024px+)
- `hidden sm:inline` - Hide on mobile, show on tablet+
- `flex-wrap` - Wrap on smaller screens

**Sidebar Behavior:**
- 768px and below: Overlay mode (drawer)
- Above 768px: Side mode (permanent)

**Toolbar Height:**
- Mobile: 56px
- Desktop: 64px

---

## 9. DEPENDENCIES

**Key Angular Packages:**
- @angular/material: 20.1.6
- @angular/cdk: 20.1.6
- @angular/forms: 20.1.7
- @angular/router: 20.1.7
- rxjs: 7.8.0

**Third-party UI:**
- primeng: 20.0.1 (@primeng/themes: 19.0.10)
- jspdf: 3.0.4 (PDF export)
- ngx-print: 20.1.0

**Styling:**
- tailwindcss: 4.1.3
- @tailwindcss/postcss: 4.1.3

---

## 10. DATA FLOW PATTERNS

### Authentication Flow
1. User logs in via `/login`
2. AuthService validates credentials
3. User resolver fetches user data
4. AppSettings resolver fetches configuration
5. Guards check roles (authGuard, adminGuard, companyUserGuard)
6. Redirects to appropriate dashboard

### Dashboard Data Flow
1. Component initializes with route resolvers
2. Get user data via `userResolver`
3. Load statistics via service
4. Display in signals (reactive state management)
5. Navigation updates url/title breadcrumb

### List/Table Data Flow
1. LoadDataListComponent receives API URL
2. Calls HttpService with pagination params
3. Returns ApiResponseObject with data array
4. TableComponent renders with displayedColumns
5. Supports inline editing, sorting, filtering

---

## 11. MATERIAL DESIGN CUSTOMIZATION

**Material Overrides (in styles.scss):**
- Toolbar background: Primary color
- Table header: Bold font, primary color
- Expansion panels: Transparent background
- Form fields: Full width

**Color Classes:**
- `.green`, `.blue`, `.red`, `.orange` - Color variants for cards
- `.bg-{color}` - Background colors
- `.col-{color}` - Text colors
- `.text-white`, `.text-blue` - Quick text colors

---

## 12. FILE STRUCTURE SUMMARY

```
UI/src/
├── app/
│   ├── core/ (Authentication, services, models)
│   │   ├── auth/ (AuthService, guards)
│   │   ├── guards/ (Role-based guards)
│   │   ├── models/ (User model)
│   │   ├── pages/ (Home, Login, Dashboards)
│   │   ├── services/ (HTTP, Auth, License)
│   │   └── resolvers/ (User, AppSettings)
│   │
│   ├── features/ (Feature modules)
│   │   ├── companies/ (Admin: Companies management)
│   │   ├── users/ (Admin: Users management)
│   │   └── company-data/ (Company: Products, Sales, Purchases)
│   │
│   ├── libs/ (Shared components, pipes, services)
│   │   ├── components/ (30+ reusable components)
│   │   ├── pipes/ (Data transformation)
│   │   ├── services/ (Utility services)
│   │   ├── types/ (Interfaces and types)
│   │   └── utils/ (Helper functions)
│   │
│   ├── app.component.ts (Root layout)
│   ├── app.routes.ts (Route configuration)
│   └── app.config.ts (App configuration)
│
├── styles.scss (Global styles)
├── themes/
│   └── _tailwind.css
└── environments/ (Environment configs)
```

---

## KEY TAKEAWAYS FOR OFFLINE APP

1. **Color System:** Use green (#1b5e20, #2e7d32) as primary
2. **Layout:** Navbar (64px) + Sidebar (250px) + Content area
3. **Components:** Use card-based design with shadow hover effects
4. **Responsive:** Implement breakpoints at 768px for sidebar toggle
5. **Forms:** Use Material Form Fields with validation
6. **Stats:** Implement interactive stat cards that link to related pages
7. **Tables:** Use Material DataTable with sorting/filtering
8. **Icons:** Material Icons throughout
9. **State:** Use Angular signals for reactive state management
10. **Navigation:** Expand/collapse sidebar menu with hierarchical structure
