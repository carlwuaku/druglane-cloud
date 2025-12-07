# DataLoader Component

A generic component for handling common data-fetching patterns with automatic loading, error, and empty state management.

## Features

- Automatic ID extraction from route params
- Loading state management with optional global spinner
- Error handling with retry functionality
- Empty state detection and display
- Customizable templates for all states
- TypeScript generic support for type safety
- Observable-based data fetching

## Basic Usage

### Simple Usage (Default dataKey='data')

```typescript
// In your component.ts
export class MyComponent {
  constructor(private myService: MyService) {}

  fetchData = (id: string) => {
    return this.myService.getDetails(id);
  }
}
```

```html
<!-- In your template - automatically extracts response.data -->
<app-data-loader [fetchData]="fetchData">
  <ng-template #content let-data>
    <h2>{{ data.name }}</h2>
    <p>{{ data.description }}</p>
  </ng-template>
</app-data-loader>
```

### Custom Data Key

If your API returns data in a different key:

```html
<!-- Extracts response.result instead of response.data -->
<app-data-loader [fetchData]="fetchData" [dataKey]="'result'">
  <ng-template #content let-data>
    <h2>{{ data.name }}</h2>
  </ng-template>
</app-data-loader>
```

### Custom Extract Function

For complex extraction logic, define the function in your component:

```typescript
export class MyComponent {
  constructor(private myService: MyService) {}

  fetchData = (id: string) => {
    return this.myService.getDetails(id);
  }

  extractData = (response: any) => {
    return response.data.items[0]; // Custom extraction
  }
}
```

```html
<app-data-loader [fetchData]="fetchData" [extractData]="extractData">
  <ng-template #content let-data>
    <h2>{{ data.name }}</h2>
  </ng-template>
</app-data-loader>
```

### Using a URL and HTTP Service

```html
<app-data-loader
  [url]="'api/licenses/details'"
  [httpService]="licensesService">
  <ng-template #content let-data>
    <app-license-details [license]="data"></app-license-details>
  </ng-template>
</app-data-loader>
```

## Custom Route Parameter

By default, the component looks for an `id` route parameter. You can customize this:

```html
<app-data-loader
  [fetchData]="fetchData"
  [idParamName]="'uuid'">
  <ng-template #content let-data>
    <!-- Your content -->
  </ng-template>
</app-data-loader>
```

## Custom State Templates

### Custom Loading Template

```html
<app-data-loader [fetchData]="fetchData">
  <ng-template #loading>
    <div class="custom-loader">
      <mat-spinner></mat-spinner>
      <p>Loading your data...</p>
    </div>
  </ng-template>

  <ng-template #content let-data>
    <!-- Your content -->
  </ng-template>
</app-data-loader>
```

### Custom Error Template

```html
<app-data-loader [fetchData]="fetchData">
  <ng-template #error let-error let-retry="retry">
    <div class="custom-error">
      <h3>Oops! Something went wrong</h3>
      <p>{{ error.message }}</p>
      <button mat-raised-button (click)="retry()">Try Again</button>
    </div>
  </ng-template>

  <ng-template #content let-data>
    <!-- Your content -->
  </ng-template>
</app-data-loader>
```

### Custom Empty State Template

```html
<app-data-loader [fetchData]="fetchData">
  <ng-template #empty>
    <div class="custom-empty">
      <mat-icon>search_off</mat-icon>
      <h3>No data found</h3>
      <p>Try adjusting your search criteria</p>
    </div>
  </ng-template>

  <ng-template #content let-data>
    <!-- Your content -->
  </ng-template>
</app-data-loader>
```

## Accessing Reload Function

The content template receives a `reload` function you can call to refresh the data:

```html
<app-data-loader [fetchData]="fetchData">
  <ng-template #content let-data let-reload="reload">
    <div>
      <h2>{{ data.name }}</h2>
      <button mat-button (click)="reload()">
        <mat-icon>refresh</mat-icon>
        Refresh
      </button>
    </div>
  </ng-template>
</app-data-loader>
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fetchData` | `(id: string) => Observable<any>` | - | Function that returns an observable for fetching data |
| `url` | `string` | - | Alternative to fetchData: direct URL for API call |
| `httpService` | `any` | - | Service with get method (required when using url) |
| `idParamName` | `string` | `'id'` | Name of the route parameter to extract |
| `extractData` | `(response: any) => T` | - | Optional function to extract data from API response |
| `dataKey` | `string` | `'data'` | Key to extract from response if extractData not provided |
| `autoLoad` | `boolean` | `true` | Whether to automatically load data on init |
| `showLoadingSpinner` | `boolean` | `true` | Show global loading spinner |
| `showInlineLoader` | `boolean` | `true` | Show inline loader in template |
| `retryable` | `boolean` | `true` | Show retry button on error |
| `emptyStateMessage` | `string` | `'No data available'` | Message to show when data is empty |
| `errorMessage` | `string` | `'Error loading data. Please try again.'` | Message to show on error |

## Output Events

| Event | Payload | Description |
|-------|---------|-------------|
| `dataLoaded` | `T \| null` | Emitted when data is successfully loaded |
| `loadError` | `any` | Emitted when an error occurs |
| `loadComplete` | `void` | Emitted when loading completes (success or error) |

## Example: Complete Component

```typescript
import { Component } from '@angular/core';
import { LicensesService } from './licenses.service';
import { License } from './license.model';

@Component({
  selector: 'app-license-details',
  template: `
    <app-data-loader
      [fetchData]="fetchLicense"
      (dataLoaded)="onLicenseLoaded($event)"
      (loadError)="onLoadError($event)">

      <ng-template #content let-license let-reload="reload">
        <div class="license-details">
          <div class="header">
            <h1>{{ license.name }}</h1>
            <button mat-icon-button (click)="reload()">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>

          <div class="details">
            <p><strong>License Number:</strong> {{ license.licenseNumber }}</p>
            <p><strong>Type:</strong> {{ license.type }}</p>
            <p><strong>Status:</strong> {{ license.status }}</p>
          </div>
        </div>
      </ng-template>

      <ng-template #error let-error let-retry="retry">
        <app-error-message [message]="'Failed to load license details'"></app-error-message>
        <button mat-raised-button color="primary" (click)="retry()">
          <mat-icon>refresh</mat-icon>
          Retry
        </button>
      </ng-template>
    </app-data-loader>
  `
})
export class LicenseDetailsComponent {
  constructor(private licensesService: LicensesService) {}

  // Simple: just pass the fetch function, component extracts response.data automatically
  fetchLicense = (id: string) => {
    return this.licensesService.getLicenseDetails(id);
  }

  onLicenseLoaded(license: License | null) {
    console.log('License loaded:', license);
  }

  onLoadError(error: any) {
    console.error('Error loading license:', error);
  }
}
```

## Manual Data Loading

You can disable auto-loading and control when to load data:

```typescript
import { Component, ViewChild } from '@angular/core';
import { DataLoaderComponent } from './data-loader.component';

@Component({
  template: `
    <button (click)="loadData()">Load Data</button>

    <app-data-loader
      #dataLoader
      [fetchData]="fetchData"
      [autoLoad]="false">
      <ng-template #content let-data>
        {{ data | json }}
      </ng-template>
    </app-data-loader>
  `
})
export class MyComponent {
  @ViewChild('dataLoader') dataLoader!: DataLoaderComponent;

  fetchData = (id: string) => this.myService.getData(id);

  loadData() {
    this.dataLoader.loadData();
  }
}
```
