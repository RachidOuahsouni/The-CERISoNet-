import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  lastLogin: string | null = '';

  constructor(
    private authService: LoginService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  login(event: Event) {
    event.preventDefault();
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        let data = response;
        if (typeof response === 'string') {
          try { data = JSON.parse(response); } catch {}
        }
        const user = data.user;
        if (user && user.id && user.pseudo) {
          localStorage.setItem('userId', user.id);
          localStorage.setItem('userPseudo', user.pseudo);
          localStorage.setItem('userAvatar', user.avatar || '');
          this.notificationService.userConnected({ id: user.id, pseudo: user.pseudo,avatar: user.avatar, nom: user.nom, prenom: user.prenom });
        }
        const currentDateTime = new Date().toLocaleString();
        localStorage.setItem('lastLogin', currentDateTime);
        this.lastLogin = currentDateTime;
        this.notificationService.show('Connexion réussie ! Dernière connexion : ' + this.lastLogin, 'success');
        this.router.navigate(['/messages']);
      },
      error: (error) => {
        this.notificationService.show('Échec de connexion. Vérifiez vos identifiants.', 'error');
      }
    });
  }
}