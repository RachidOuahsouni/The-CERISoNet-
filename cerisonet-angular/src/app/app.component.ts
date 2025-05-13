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
    // Écoute les notifications
    this.notificationService.notification$.subscribe((notification) => {
      this.message = notification.message;
      this.messageType = notification.type;
    });
    
    // Vérifie si l'utilisateur est connecté au chargement de l'app
    const userId = localStorage.getItem('userId');
    const userPseudo = localStorage.getItem('userPseudo');
    const userAvatar = localStorage.getItem('userAvatar');
    
    // Si connecté, envoie l'événement userConnected pour mettre à jour la liste
    if (userId && userPseudo) {
      this.notificationService.userConnected({
        id: Number(userId),
        pseudo: userPseudo,
        avatar: userAvatar || undefined,
        nom: localStorage.getItem('userNom') || undefined,
        prenom: localStorage.getItem('userPrenom') || undefined
      });
    }
  }

  handleNotificationClose() {
    this.message = '';
  }

  isLoggedIn(): boolean {
    // On considère connecté si userId existe dans le localStorage
    return !!localStorage.getItem('userId');
  }

  logout() {
    const userId = localStorage.getItem('userId');
    const userPseudo = localStorage.getItem('userPseudo');
    if (userId && userPseudo) {
      this.notificationService.userDisconnected({ 
        id: Number(userId), 
        pseudo: userPseudo,
        avatar: localStorage.getItem('userAvatar') || undefined
      });
    }
    fetch('https://pedago.univ-avignon.fr:3140/logout', { credentials: 'include' })
      .finally(() => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userPseudo');
        localStorage.removeItem('userAvatar');
        localStorage.removeItem('userNom');
        localStorage.removeItem('userPrenom');
        localStorage.removeItem('lastLogin');
        this.router.navigate(['/login']);
        this.notificationService.show('Déconnexion réussie.', 'success');
      });
  }
}