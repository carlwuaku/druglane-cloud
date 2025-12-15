import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { PageContainerComponent } from '../../../../libs/components/page-container/page-container.component';
import { CompanyDataService, ProductStatistics } from '../../services/company-data.service';
import { StatsCardComponent } from '../../../../libs/components/stats-card/stats-card.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [CommonModule, LoadDataListComponent, PageContainerComponent, StatsCardComponent, MatExpansionModule, MatIconModule],
    templateUrl: './products-list.component.html',
    styleUrl: './products-list.component.scss'
})
export class ProductsListComponent implements OnInit {
    private route = inject(ActivatedRoute);

    apiUrl = signal<string>('api/company-data/products');

    // Statistics signals
    statistics = signal<ProductStatistics | null>(null);
    loading = signal<boolean>(true);
    currentFilter = signal<string | null>(null);

    constructor(private companyDataService: CompanyDataService) {}

    ngOnInit(): void {
        // Check for query parameters (from dashboard links)
        this.route.queryParams.subscribe(params => {
            const stockFilter = params['stock_filter'];
            if (stockFilter) {
                this.filterProducts(stockFilter);
            }
        });

        this.loadStatistics();
    }

    loadStatistics(): void {
        this.loading.set(true);
        this.companyDataService.getProductStatistics().subscribe({
            next: (stats) => {
                this.statistics.set(stats);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Failed to load product statistics', error);
                this.loading.set(false);
            }
        });
    }

    filterProducts(filter: string | null): void {
        this.currentFilter.set(filter);
        if (filter) {
            this.apiUrl.set(`api/company-data/products?stock_filter=${filter}`);
        } else {
            this.apiUrl.set('api/company-data/products');
        }
    }

    isFilterActive(filter: string | null): boolean {
        return this.currentFilter() === filter;
    }
}
