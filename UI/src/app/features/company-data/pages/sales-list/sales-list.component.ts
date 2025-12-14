import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { PageContainerComponent } from '../../../../libs/components/page-container/page-container.component';
import { CompanyDataService, SalesStatistics } from '../../services/company-data.service';
import { StatsCardComponent } from '../../../../libs/components/stats-card/stats-card.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sales-list',
    standalone: true,
    imports: [CommonModule, LoadDataListComponent, PageContainerComponent, StatsCardComponent, MatExpansionModule, MatIconModule],
    templateUrl: './sales-list.component.html',
    styleUrl: './sales-list.component.scss'
})
export class SalesListComponent implements OnInit {
    apiUrl = 'api/company-data/sales';

    // Statistics signals
    statistics = signal<SalesStatistics | null>(null);
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
        this.companyDataService.getSalesStatistics().subscribe({
            next: (stats) => {
                this.statistics.set(stats);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Failed to load sales statistics', error);
                this.loading.set(false);
            }
        });
    }

    navigateToSalesDetails(): void {
        this.router.navigate(['/sales-details']);
    }
}
