# Druglane Cloud UI - Complete Component File Reference

## Layout & Core Components

### Root Application Layout
- **App Component (Root):** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/app.component.ts`
  - Template: `app.component.html`
  - Styles: `app.component.scss`
  - Contains: Toolbar, Sidenav Container, Toast notifications

- **Sidebar Navigation:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/sidebar-nav/sidebar-nav.component.ts`
  - Template: `sidebar-nav.component.html`
  - Styles: `sidebar-nav.component.scss`
  - Features: User profile section, expandable menu, role-based navigation

---

## Page Components (Core Pages)

### Dashboard Pages
1. **Admin Dashboard (Home):** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/home/home.component.ts`
   - Template: `home.component.html`
   - Styles: `home.component.scss`
   - Displays: Company stats, license status, backup info, user activity

2. **Company Dashboard:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/company-dashboard/company-dashboard.component.ts`
   - Template: `company-dashboard.component.html`
   - Displays: Sales, purchases, inventory stats, product expiry info

### Authentication Pages
3. **Login:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/login/login.component.ts`
   - Template: `login.component.html`
   - Styles: `login.component.scss`

4. **Forgot Password:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/forgot-password/forgot-password.component.ts`
   - Template: `forgot-password.component.html`

5. **Reset Password:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/pages/reset-password/reset-password.component.ts`
   - Template: `reset-password.component.html`

---

## Feature Module Components

### 1. Company Data Module (Products, Sales, Purchases)
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/`

#### Products
- **Products List:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/products-list/products-list.component.ts`
  - Template: `products-list.component.html`
  - Styles: `products-list.component.scss`
  - Features: Stock statistics, inventory status, expiry tracking, clickable filters

#### Sales
- **Sales List:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/sales-list/sales-list.component.ts`
  - Template: `sales-list.component.html`
  - Styles: `sales-list.component.scss`
  - Features: Sales metrics, growth rate, top products

- **Sales Details:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/sales-details/sales-details.component.ts`
  - Template: `sales-details.component.html`

#### Purchases
- **Purchases List:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/purchases-list/purchases-list.component.ts`
  - Template: `purchases-list.component.html`
  - Features: Purchase metrics, top suppliers/products

- **Purchase Details:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/pages/purchase-details/purchase-details.component.ts`
  - Template: `purchase-details.component.html`

### 2. Companies Module (Admin)
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/companies/pages/`

- **Companies List:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/companies/pages/companies-list/companies-list.component.ts`
  - Template: `companies-list.component.html`
  - Features: List, search, filter, export

- **Company Form:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/companies/pages/company-form/company-form.component.ts`
  - Template: `company-form.component.html`
  - Features: Create, edit, view company details

### 3. Users Module (Admin)
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/users/pages/`

- **Users List:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/users/pages/users-list/users-list.component.ts`
  - Template: `users-list.component.html`

- **User Form:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/users/pages/user-form/user-form.component.ts`
  - Template: `user-form.component.html`

### 4. License Module
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/license/`

- **Activate Component:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/license/activate.component.ts`
  - Template: `activate.component.html`
  - Styles: `activate.component.scss`

---

## Shared Components Library

**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/components/`

### Data Display Components
1. **Stats Card:** `/stats-card/stats-card.component.ts`
   - Purpose: Display metric cards with icon and count
   - Files: `stats-card.component.html`, `stats-card.component.scss`
   - Used on: All dashboards, statistics sections

2. **Load Data List:** `/load-data-list/load-data-list.component.ts`
   - Purpose: Generic paginated list/table loader
   - Files: `load-data-list.component.html`, `load-data-list.component.scss`
   - Features: Pagination, search, filtering, export, sorting

3. **Table:** `/table/table.component.ts`
   - Purpose: Material DataTable wrapper with advanced features
   - Files: `table.component.html`, `table.component.scss`
   - Features: Selection, sorting, inline editing, custom renderers

4. **List:** `/list/list.component.ts`
   - Purpose: Simple list display
   - Files: `list.component.html`, `list.component.scss`

5. **Dashboard Tile:** `/dashboard-tile/dashboard-tile.component.ts`
   - Purpose: Tile-based dashboard cards
   - Files: `dashboard-tile.component.html`, `dashboard-tile.component.scss`

### Layout Components
6. **Page Container:** `/page-container/page-container.component.ts`
   - Purpose: Consistent page layout wrapper
   - Files: `page-container.component.html`, `page-container.component.scss`

7. **Section Container:** `/section-container/section-container.component.ts`
   - Purpose: Styled container for sections
   - Files: `section-container.component.html`, `section-container.component.scss`

### Form Components
8. **Form Generator:** `/form-generator/form-generator.component.ts`
   - Purpose: Dynamic form creation from config
   - Files: `form-generator.component.html`, `form-generator.component.scss`
   - Features: Multiple field types, validation, custom templates
   - Interface: `/form-generator/form-generator.interface.ts`

9. **Dialog Form:** `/dialog-form/dialog-form.component.ts`
   - Purpose: Modal form dialog
   - Files: `dialog-form.component.html`, `dialog-form.component.scss`

### Input Components
10. **String Array Input:** `/string-array-input/string-array-input.component.ts`
    - Purpose: Input for array of strings (tags-like)

11. **Select Object:** `/select-object/select-object.component.ts`
    - Purpose: Select dropdown for objects

12. **File Uploader:** `/file-uploader/file-uploader.component.ts`
    - Purpose: File upload with progress

13. **Inline Editor:** `/inline-editor/inline-editor.component.ts`
    - Purpose: Inline content editing

14. **JSON Editor:** `/json-editor/json-editor.component.ts`
    - Purpose: JSON content editor

### Utility Components
15. **Alert:** `/alert/alert.component.ts`
    - Purpose: Alert/notification messages
    - Types: success, error, warning, info

16. **Loading:** `/loading/loading.component.ts`
    - Purpose: Loading spinner/placeholder

17. **Pagination:** `/pagination/pagination.component.ts`
    - Purpose: Pagination controls

18. **Progress Dialog:** `/progress-dialog/progress-dialog.component.ts`
    - Purpose: Modal progress indicator

19. **Data Loader:** `/data-loader/data-loader.component.ts`
    - Purpose: Loading placeholder for data

20. **Error Message:** `/error-message/error-message.component.ts`
    - Purpose: Error message display

### Special Components
21. **PDF Export Button:** `/pdf-export-button/pdf-export-button.component.ts`
    - Purpose: Export to PDF functionality
    - Features: Multiple files: `pdf-export-button.component.ts`, `pdf-export-button.scss`

22. **Country Flag:** `/country-flag/country-flag.component.ts`
    - Purpose: Display country flags

23. **Secure Image:** `/secure-image/secure-image.component.ts`
    - Purpose: Image with authentication/security

24. **API Count:** `/api-count/api-count.component.ts`
    - Purpose: Display count from API

25. **Card:** `/card/card.component.ts`
    - Purpose: Generic card component

---

## Core Services

**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/services/`

### Authentication
- **Auth Service:** `auth/auth.service.ts`
  - Methods: login, logout, getUser, isLoggedIn$
  - Related: `auth.service.spec.ts`

### HTTP
- **HTTP Service:** `http/http.service.ts`
  - Methods: get, post, put, delete, patch
  - Related: `http.service.spec.ts`

- **File Upload Service:** `http/file-upload.service.ts`
  - Methods: uploadFile, uploadFiles
  - Related: `file-upload.service.spec.ts`

### Utilities
- **Date Service:** `date/date.service.ts`
  - Methods: date manipulation, formatting
  - Related: `date.service.spec.ts`

- **License Service:** `license/license.service.ts`
  - Methods: checkLicense, validateLicense

---

## Feature Service

**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/company-data/services/`

- **Company Data Service:** `company-data.service.ts`
  - Methods: getProducts, getSales, getPurchases, getStatistics
  - Interfaces: ProductStatistics, SalesStatistics, PurchaseStatistics

**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/features/companies/services/`

- **Company Service:** `company.service.ts`
  - Methods: getCompanies, createCompany, updateCompany, deleteCompany
  - Interface: AdminStatistics

---

## Shared Libraries

### Pipes
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/pipes/`

- `filter-empty-values.pipe.ts` - Filter out empty values from objects
- Other utility pipes for data transformation

### Types/Interfaces
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/types/`

- `MenuItem.interface.ts` - Menu item structure
- `DataAction.type.ts` - Data table actions
- `ApiResponse.type.ts` - API response structure
- `HomeSubtitle.type.ts` - Dashboard subtitle config
- `AppSettings.interface.ts` - Application settings

### Utils
**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/libs/utils/`

- `helper.ts` - Utility functions (isArray, getLabelFromKey, etc.)

---

## Models

**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/models/`

- **User Model:** `user.model.ts`
  - Properties: id, name, displayName, email, role, company, isAdmin, isCompanyUser

---

## Guards

**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/guards/`

- `admin.guard.ts` - Admin role check
- `company-user.guard.ts` - Company user role check

**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/auth/`

- `auth.guard.ts` - Authentication check

---

## Resolvers

**Location:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/core/resolvers/`

- `user.resolver.ts` - Fetches current user data before route activation
- `app-settings.resolver.ts` - Fetches app settings/configuration

---

## Routing

- **Routes Config:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/app.routes.ts`
  - All route paths, guards, lazy loading configuration

---

## Configuration Files

- **App Config:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/app/app.config.ts`
  - Angular provider configuration, Material theme setup

- **Global Styles:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/styles.scss`
  - Global CSS rules, Material overrides, utility classes, color palette definitions

- **Themes:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/themes/_tailwind.css`
  - Tailwind CSS configuration

---

## Entry Points

- **Main:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/main.ts`
- **Index:** `/Users/carl/Documents/projects/druglane/druglane-cloud/UI/src/index.html`

---

## Summary Statistics

- **Total Components:** 30+ shared components
- **Feature Modules:** 4 (companies, users, company-data, license)
- **Page Components:** 8+ dashboard/page components
- **Services:** 8+ core and feature services
- **Pipes:** 5+ data transformation pipes
- **Guards:** 3 role-based and auth guards
- **Total TypeScript Files:** 100+
- **SCSS Files:** 40+ component stylesheets + global styles
