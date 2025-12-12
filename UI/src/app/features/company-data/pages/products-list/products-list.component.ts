import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { PageContainerComponent } from '../../../../libs/components/page-container/page-container.component';

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [CommonModule, LoadDataListComponent, PageContainerComponent],
    templateUrl: './products-list.component.html',
    styleUrl: './products-list.component.scss'
})
export class ProductsListComponent {
    apiUrl = '/api/company-data/products';
}
