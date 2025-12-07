import { Component, Input, SimpleChanges } from '@angular/core';
import { Observable, Subject, shareReplay, catchError, of, takeUntil } from 'rxjs';
import { HttpService } from '../../../core/services/http/http.service';

@Component({
  selector: 'app-api-count',
  imports: [],
  templateUrl: './api-count.component.html',
  styleUrl: './api-count.component.scss'
})
export class ApiCountComponent {

  @Input({ required: true }) url: string = '';
  count: any = '...';
  loading: boolean = false;
  // the name of the property containing the data from the api
  @Input() property: string = 'count';//may be a nested property using dot notation

  // Static cache to share across all component instances
  private static cache = new Map<string, Observable<any>>();
  // Subject to handle component destruction
  private destroy$ = new Subject<void>();

  constructor(private httpService: HttpService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url'] && changes['url'].currentValue !== changes['url'].previousValue) {
      this.getCount();
    }
  }

  ngOnInit(): void {
    this.getCount();
  }

  ngOnDestroy(): void {
    ApiCountComponent.clearCache()
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCount(): void {
    if (!this.url) {
      this.count = "-";
      return;
    }

    this.loading = true;

    // Check if we already have a cached observable for this URL
    if (!ApiCountComponent.cache.has(this.url)) {
      // Create and cache the observable
      const request$ = this.httpService.get<any>(this.url).pipe(
        shareReplay(1), // Cache the result and replay it for subsequent subscribers
        catchError(error => {
          console.error('API count error for URL:', this.url, error);
          return of({ data: "-" }); // Return default structure on error
        })
      );

      ApiCountComponent.cache.set(this.url, request$);
    }

    // Subscribe to the cached observable
    ApiCountComponent.cache.get(this.url)!
      .pipe(takeUntil(this.destroy$)) // Automatically unsubscribe when component is destroyed
      .subscribe(data => {
        this.loading = false;
        //if the property is set use it. take into account nested properties
        if (this.property) {
          this.count = this.getNestedProperty(data.data, this.property);
        } else {
          this.count = data.data;
        }
        this.count = this.property ? data.data[this.property] : data.data || "-";
      });
  }

  // Optional: Method to clear cache for specific URL or all URLs
  static clearCache(url?: string): void {
    if (url) {
      ApiCountComponent.cache.delete(url);
    } else {
      ApiCountComponent.cache.clear();
    }
  }

  // Optional: Method to get cache size (for debugging)
  static getCacheSize(): number {
    return ApiCountComponent.cache.size;
  }

  private getNestedProperty(object: any, property: string): any {
    const parts = property.split('.');
    let current = object;
    for (const part of parts) {
      current = current[part];
    }
    return current;
  }
}
