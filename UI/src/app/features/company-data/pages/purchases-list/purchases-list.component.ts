import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { PageContainerComponent } from '../../../../libs/components/page-container/page-container.component';

@Component({
    selector: 'app-purchases-list',
    standalone: true,
    imports: [CommonModule, LoadDataListComponent, PageContainerComponent],
    templateUrl: './purchases-list.component.html',
    styleUrl: './purchases-list.component.scss'
})
export class PurchasesListComponent {
    apiUrl = '/api/company-data/purchases';
}
