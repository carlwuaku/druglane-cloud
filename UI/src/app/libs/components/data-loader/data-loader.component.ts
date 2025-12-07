import { Component, contentChild, effect, inject, input, output, signal, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { NotifyService } from '../../services/notify.service';
import { LoadingComponent } from '../loading/loading.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-data-loader',
  templateUrl: './data-loader.component.html',
  styleUrls: ['./data-loader.component.scss'],
  imports: [CommonModule, LoadingComponent, ErrorMessageComponent, MatIconModule, MatButtonModule],
  standalone: true
})
export class DataLoaderComponent<T = any> {
  // Services
  private ar = inject(ActivatedRoute);
  private notifyService = inject(NotifyService);

  // Configuration inputs
  fetchData = input<((id: string) => Observable<any>) | undefined>(); // Function that returns observable
  url = input<string | undefined>(); // Alternative: direct URL (requires httpService to be passed)
  httpService = input<any>(); // Service with get method if using URL
  idParamName = input<string>('id'); // Name of the route param to extract
  extractData = input<((response: any) => T) | undefined>(); // Optional: How to extract data from response
  dataKey = input<string>('data'); // Key to extract data from response if extractData not provided
  autoLoad = input<boolean>(true); // Whether to load data automatically on init
  showLoadingSpinner = input<boolean>(true); // Show global loading spinner
  showInlineLoader = input<boolean>(true); // Show inline loader in template
  retryable = input<boolean>(true); // Show retry button on error
  emptyStateMessage = input<string>('No data available');
  errorMessage = input<string>('Error loading data. Please try again.');

  // Template inputs
  contentTemplate = contentChild<TemplateRef<any>>('content');
  loadingTemplate = contentChild<TemplateRef<any>>('loading');
  errorTemplate = contentChild<TemplateRef<any>>('error');
  emptyTemplate = contentChild<TemplateRef<any>>('empty');

  // Outputs
  dataLoaded = output<T | null>();
  loadError = output<any>();
  loadComplete = output<void>();

  // State signals
  id = toSignal(this.ar.paramMap);
  data = signal<T | null>(null);
  loading = signal<boolean>(false);
  error = signal<boolean>(false);
  errorDetails = signal<any>(null);
  isEmpty = signal<boolean>(false);

  constructor() {
    // Auto-load effect when route params change
    effect(() => {
      const params = this.id();
      const paramName = this.idParamName();
      const shouldAutoLoad = this.autoLoad();

      if (params) {
        const idValue = params.get(paramName);
        if (shouldAutoLoad && idValue) {
          this.loadData(idValue);
        }
      }
    });
  }

  loadData(idValue?: string): void {
    // Get the ID from parameter or route params
    const currentId = idValue || this.id()?.get(this.idParamName());

    if (!currentId) {
      console.warn('No ID available to load data');
      return;
    }

    // Validate that we have a way to fetch data
    const fetchDataFn = this.fetchData();
    const urlValue = this.url();
    const httpSvc = this.httpService();

    if (!fetchDataFn && !urlValue) {
      console.error('Either fetchData function or url must be provided');
      return;
    }

    if (urlValue && !httpSvc) {
      console.error('httpService must be provided when using url');
      return;
    }

    this.resetState();
    this.loading.set(true);

    if (this.showLoadingSpinner()) {
      this.notifyService.showLoading();
    }

    // Get the observable
    let dataObservable: Observable<any>;
    if (fetchDataFn) {
      dataObservable = fetchDataFn(currentId);
    } else if (urlValue && httpSvc) {
      const fullUrl = urlValue.includes('?')
        ? `${urlValue}&id=${currentId}`
        : `${urlValue}/${currentId}`;
      dataObservable = httpSvc.get(fullUrl);
    } else {
      return;
    }

    // Subscribe to the observable
    dataObservable.subscribe({
      next: (response) => {
        // Extract data using custom function or default key
        const extractFn = this.extractData();
        const key = this.dataKey();

        let extractedData: T;
        if (extractFn) {
          extractedData = extractFn(response);
        } else {
          extractedData = key ? response[key] : response;
        }

        this.data.set(extractedData);
        this.isEmpty.set(this.checkIfEmpty(extractedData));
        this.dataLoaded.emit(extractedData);

        if (this.showLoadingSpinner()) {
          this.notifyService.hideLoading();
        }
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error.set(true);
        this.errorDetails.set(err);
        this.data.set(null);
        this.loadError.emit(err);

        if (this.showLoadingSpinner()) {
          this.notifyService.hideLoading();
        }
      },
      complete: () => {
        this.loading.set(false);
        this.loadComplete.emit();
      }
    });
  }

  retry(): void {
    this.loadData();
  }

  private resetState(): void {
    this.error.set(false);
    this.errorDetails.set(null);
    this.data.set(null);
    this.isEmpty.set(false);
  }

  private checkIfEmpty(data: any): boolean {
    if (!data) return true;
    if (Array.isArray(data)) return data.length === 0;
    if (typeof data === 'object') return Object.keys(data).length === 0;
    return false;
  }

  // Public method to manually reload data
  public reload(): void {
    this.loadData();
  }
}
