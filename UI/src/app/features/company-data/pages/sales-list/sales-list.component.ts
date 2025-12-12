import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { PageContainerComponent } from '../../../../libs/components/page-container/page-container.component';

@Component({
    selector: 'app-sales-list',
    standalone: true,
    imports: [CommonModule, LoadDataListComponent, PageContainerComponent],
    templateUrl: './sales-list.component.html',
    styleUrl: './sales-list.component.scss'
})
export class SalesListComponent {
    apiUrl = '/api/company-data/sales';
}
