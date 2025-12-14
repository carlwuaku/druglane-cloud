import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { PageContainerComponent } from '../../../../libs/components/page-container/page-container.component';

@Component({
  selector: 'app-sales-details',
  standalone: true,
  imports: [CommonModule, LoadDataListComponent, PageContainerComponent],
  templateUrl: './sales-details.component.html',
  styleUrl: './sales-details.component.scss'
})
export class SalesDetailsComponent {
  apiUrl = 'api/company-data/sales-details';
}
