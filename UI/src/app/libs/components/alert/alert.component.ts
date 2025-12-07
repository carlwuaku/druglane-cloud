import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
export type AlertType = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-alert',
  imports: [MatIconModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {
  type = input.required<AlertType>()
  title = input<string>();
  message = input<string>();
  dismissible: boolean = false;
  visible: boolean = true;

  @Output() dismissed = new EventEmitter<void>();

  hasContent = false;

  ngAfterContentInit() {
    // Check if there's projected content
    this.hasContent = true;
  }

  dismiss() {
    this.visible = false;
    this.dismissed.emit();
  }

  icon() {
    switch (this.type()) {
      case 'info':
        return 'info';
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
    }
  }
}
