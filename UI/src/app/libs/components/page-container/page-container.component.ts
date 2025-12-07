import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-container',
  imports: [],
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.scss'
})
export class PageContainerComponent {
  pageTitle = input.required<string>()
}
