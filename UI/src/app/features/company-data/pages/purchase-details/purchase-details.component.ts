import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { PageContainerComponent } from '../../../../libs/components/page-container/page-container.component';

@Component({
  selector: 'app-purchase-details',
  standalone: true,
  imports: [CommonModule, LoadDataListComponent, PageContainerComponent],
  templateUrl: './purchase-details.component.html',
  styleUrl: './purchase-details.component.scss'
})
export class PurchaseDetailsComponent {
  apiUrl = 'api/company-data/purchase-details';
}
