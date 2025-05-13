import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './components/notification/notification.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, CommonModule, NotificationComponent],
})
export class AppComponent implements OnInit {
  title = 'cerisonet-angular';
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private router: Router, private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notification$.subscribe(({ message, type }) => {
      this.message = message;
      this.messageType = type;
    });
  }

  handleNotificationClose() {
    this.message = '';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userId');
  }

  logout() {
    fetch('https://pedago.univ-avignon.fr:3140/logout', { credentials: 'include' })
      .finally(() => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userPseudo');
        localStorage.removeItem('lastLogin');
        this.router.navigate(['/login']);
        this.notificationService.show('Déconnexion réussie.', 'success');
      });
  }
}