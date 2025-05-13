import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification" [ngClass]="type">
      <span>{{ message }}</span>
      <button class="close-btn" (click)="close()">×</button>
    </div>
  `,
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  @Output() notificationClosed = new EventEmitter<void>();

  close() {
    this.notificationClosed.emit();
  }
}