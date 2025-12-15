import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { PageContainerComponent } from '../../../../libs/components/page-container/page-container.component';
import { CompanyDataService, SalesStatistics } from '../../services/company-data.service';
import { StatsCardComponent } from '../../../../libs/components/stats-card/stats-card.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { IFormGenerator } from '../../../../libs/components/form-generator/form-generator.interface';

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

    // Filter date range
    private startDate: string | undefined;
    private endDate: string | undefined;
    isFiltered = signal<boolean>(false);

    constructor(
        private companyDataService: CompanyDataService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadStatistics();
    }

    loadStatistics(startDate?: string, endDate?: string): void {
        this.loading.set(true);
        this.companyDataService.getSalesStatistics(startDate, endDate).subscribe({
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

    handleFilterSubmit = (params: IFormGenerator[]): void => {
        // Extract date range from filters
        const dateFilter = params.find(p => p.name === 'date' || p.type === 'date-range');

        if (dateFilter && dateFilter.value) {
            if (dateFilter.type === 'date-range') {
                // Parse the date range value
                const dateRange = dateFilter.value.split(' to ');
                if (dateRange.length === 2) {
                    this.startDate = this.formatDate(new Date(dateRange[0]));
                    this.endDate = this.formatDate(new Date(dateRange[1]));
                    this.isFiltered.set(true);
                }
            } else {
                // Single date filter
                this.startDate = this.formatDate(new Date(dateFilter.value));
                this.endDate = this.startDate;
                this.isFiltered.set(true);
            }
        } else {
            // No date filter applied, reset to all-time stats
            this.startDate = undefined;
            this.endDate = undefined;
            this.isFiltered.set(false);
        }

        // Reload statistics with the new date range
        this.loadStatistics(this.startDate, this.endDate);
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    navigateToSalesDetails(): void {
        this.router.navigate(['/sales-details']);
    }
}
