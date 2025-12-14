import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '../../models/user.model';
import { StatsCardComponent } from '../../../libs/components/stats-card/stats-card.component';
import { AlertComponent } from '../../../libs/components/alert/alert.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CompanyDataService, ProductStatistics } from '../../../features/company-data/services/company-data.service';

@Component({
    selector: 'app-company-dashboard',
    standalone: true,
    imports: [StatsCardComponent, AlertComponent, MatTabsModule],
    templateUrl: './company-dashboard.component.html',
    styleUrl: './company-dashboard.component.scss'
})
export class CompanyDashboardComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private data = toSignal(this.route.data);
    private companyDataService = inject(CompanyDataService);

    user = computed(() => this.data()?.['userData'] as User | null);

    // Product statistics
    statistics = signal<ProductStatistics | null>(null);

    // Inventory Stats
    totalProducts = signal<number>(0);
    todaySales = signal<number>(0);
    expiredProducts = signal<number>(0);
    expiringNextMonth = signal<number>(0);
    outOfStock = signal<number>(0);
    nearingMinStock = signal<number>(0);
    exceedingMaxStock = signal<number>(0);
    activeProducts = signal<number>(0);
    totalStockValue = signal<number>(0);
    totalCostValue = signal<number>(0);

    loading = signal<boolean>(true);

    ngOnInit(): void {
        this.loadProductStatistics();
        // Keep dummy data for sales and expiry for now
        this.todaySales.set(3450);
        this.expiredProducts.set(23);
        this.expiringNextMonth.set(87);
    }

    loadProductStatistics(): void {
        this.loading.set(true);
        this.companyDataService.getProductStatistics().subscribe({
            next: (stats) => {
                this.statistics.set(stats);
                this.totalProducts.set(stats.total_products);
                this.outOfStock.set(stats.zero_stock_count);
                this.nearingMinStock.set(stats.below_min_stock_count);
                this.exceedingMaxStock.set(stats.above_max_stock_count);
                this.totalStockValue.set(stats.total_stock_value);
                this.totalCostValue.set(stats.total_cost_value);
                this.activeProducts.set(stats.total_products - stats.zero_stock_count);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Failed to load product statistics', error);
                this.loading.set(false);
            }
        });
    }
}
