import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { PageContainerComponent } from '../../../../libs/components/page-container/page-container.component';
import { CompanyDataService, PurchaseStatistics } from '../../services/company-data.service';
import { StatsCardComponent } from '../../../../libs/components/stats-card/stats-card.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
    selector: 'app-purchases-list',
    standalone: true,
    imports: [CommonModule, LoadDataListComponent, PageContainerComponent, StatsCardComponent, MatExpansionModule, MatIconModule],
    templateUrl: './purchases-list.component.html',
    styleUrl: './purchases-list.component.scss'
})
export class PurchasesListComponent implements OnInit {
    apiUrl = 'api/company-data/purchases';

    // Statistics signals
    statistics = signal<PurchaseStatistics | null>(null);
    loading = signal<boolean>(true);

    constructor(
        private companyDataService: CompanyDataService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadStatistics();
    }

    loadStatistics(): void {
        this.loading.set(true);
        this.companyDataService.getPurchaseStatistics().subscribe({
            next: (stats) => {
                this.statistics.set(stats);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Failed to load purchase statistics', error);
                this.loading.set(false);
            }
        });
    }

    navigateToPurchaseDetails(): void {
        this.router.navigate(['/purchase-details']);
    }
}
