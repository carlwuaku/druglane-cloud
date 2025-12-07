import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  private messageService = inject(MessageService);
  private snackBar = inject(MatSnackBar);
  constructor() { }

  showNotification(message: string, type: "success" | "info" | "warn" | "error", delay?: number) {

    this.messageService.add({
      severity: type, summary: type,
      detail: message
    });
  }
  noConnectionNotification() {
    this.hideLoading()
    this.showNotification("Unable to send data to server. Please try again or contact admin", "error", 3000);
  }

  successNotification(text: string) {
    this.showNotification(text, "success", 3000);
  }

  failNotification(text: string) {
    this.showNotification(text, "error", 3000);
  }

  notPermitted() {
    this.showNotification("You are not permitted to view the page", "error", 3000);
  }

  showLoading() {
    this.messageService.add({
      key: 'loading',
      severity: 'info',
      summary: 'Loading',
      detail: 'Please wait...',
      sticky: true
    });
  }

  hideLoading() {
    this.messageService.clear('loading');
  }

  infoNotification(text: string) {
    this.showNotification(text, "info", 3000);
  }
}
