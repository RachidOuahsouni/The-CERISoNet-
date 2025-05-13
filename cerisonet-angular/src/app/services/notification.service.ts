import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private socket: Socket;
  private notificationSubject = new Subject<{ message: string, type: 'success' | 'error' }>();
  private usersOnlineSubject = new BehaviorSubject<any[]>([]);

  notification$ = this.notificationSubject.asObservable();
  usersOnline$ = this.usersOnlineSubject.asObservable();

  constructor() {
    this.socket = io('https://pedago.univ-avignon.fr:3140', { transports: ['websocket'] });

    // Notifications de connexion/déconnexion
    this.socket.on('notification', (data) => {
      const currentUserId = Number(localStorage.getItem('userId'));
      if (data.type === 'login') {
        if (data.user.id !== currentUserId) {
          this.show(`${data.user.pseudo} vient de se connecter`, 'success');
        }
      } else if (data.type === 'logout') {
        if (data.user.id !== currentUserId) {
          this.show(`${data.user.pseudo} vient de se déconnecter`, 'error');
        }
      }
    });

    // Liste des connectés
    this.socket.on('usersOnline', (users) => {
      this.usersOnlineSubject.next(users);
    });
  }

  userConnected(user: { id: number, pseudo: string, avatar?: string, nom?: string, prenom?: string }) {
    this.socket.emit('userConnected', user);
  }

  userDisconnected(user: { id: number, pseudo: string, avatar?: string, nom?: string, prenom?: string }) {
    this.socket.emit('userDisconnected', user);
  }

  show(message: string, type: 'success' | 'error' = 'success') {
    this.notificationSubject.next({ message, type });
  }
}