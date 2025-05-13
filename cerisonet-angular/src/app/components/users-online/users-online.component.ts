import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-users-online',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-online-bubble" (click)="toggleList()">
      <span>👥</span>
      <span class="count">{{ users.length }}</span>
    </div>
    <div class="users-online-list" *ngIf="showList">
      <div class="header">
        <strong>Connectés</strong>
        <button (click)="toggleList()">×</button>
      </div>
      <ul>
        <li *ngFor="let user of users" class="user-item">
          <img class="user-avatar" [src]="user.avatar || 'https://via.placeholder.com/30'" alt="Avatar" />
          <div class="user-info">
            <span class="user-pseudo">{{ user.pseudo }}</span>
            <span class="user-name" *ngIf="user.nom">{{ user.nom }} {{ user.prenom }}</span>
          </div>
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./users-online.component.css']
})
export class UsersOnlineComponent {
  users: any[] = [];
  showList = false;

  constructor(private notificationService: NotificationService) {
    this.notificationService.usersOnline$.subscribe(users => {
      this.users = users;
    });
  }

  toggleList() {
    this.showList = !this.showList;
  }
}