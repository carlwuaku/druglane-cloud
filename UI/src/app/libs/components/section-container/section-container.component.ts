import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-container',
  imports: [CommonModule],
  templateUrl: './section-container.component.html',
  styleUrl: './section-container.component.scss'
})
export class SectionContainerComponent {
  @Input() title: string = 'Section Title';
  @Input() childStyle: string = '';
  @Input() containerStyle: string = '';
}
