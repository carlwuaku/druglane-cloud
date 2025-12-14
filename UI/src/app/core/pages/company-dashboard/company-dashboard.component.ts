import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '../../models/user.model';
import { StatsCardComponent } from '../../../libs/components/stats-card/stats-card.component';
import { AlertComponent } from '../../../libs/components/alert/alert.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CompanyDataService, ProductStatistics, SalesStatistics, PurchaseStatistics, DatabaseInfo } from '../../../features/company-data/services/company-data.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-company-dashboard',
    standalone: true,
    imports: [CommonModule, StatsCardComponent, AlertComponent, MatTabsModule, MatExpansionModule, MatIconModule],
    templateUrl: './company-dashboard.component.html',
    styleUrl: './company-dashboard.component.scss'
})
export class CompanyDashboardComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private data = toSignal(this.route.data);
    private companyDataService = inject(CompanyDataService);

    user = computed(() => this.data()?.['userData'] as User | null);

    // Statistics
    productStats = signal<ProductStatistics | null>(null);
    salesStats = signal<SalesStatistics | null>(null);
    purchaseStats = signal<PurchaseStatistics | null>(null);
    databaseInfo = signal<DatabaseInfo | null>(null);

    loading = signal<boolean>(true);

    ngOnInit(): void {
        this.loadAllStatistics();
    }

    loadAllStatistics(): void {
        this.loading.set(true);
        forkJoin({
            products: this.companyDataService.getProductStatistics(),
            sales: this.companyDataService.getSalesStatistics(),
            purchases: this.companyDataService.getPurchaseStatistics(),
            dbInfo: this.companyDataService.getDatabaseInfo()
        }).subscribe({
            next: (stats) => {
                this.productStats.set(stats.products);
                this.salesStats.set(stats.sales);
                this.purchaseStats.set(stats.purchases);
                this.databaseInfo.set(stats.dbInfo);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Failed to load statistics', error);
                this.loading.set(false);
            }
        });
    }
}
