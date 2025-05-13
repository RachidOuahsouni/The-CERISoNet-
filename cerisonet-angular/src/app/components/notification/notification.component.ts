import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  @Output() notificationClosed = new EventEmitter<void>();

  ngOnInit() {
    setTimeout(() => this.closeNotification(), 2000); // 2 secondes
  }


  closeNotification() {
    this.notificationClosed.emit();
  }
}