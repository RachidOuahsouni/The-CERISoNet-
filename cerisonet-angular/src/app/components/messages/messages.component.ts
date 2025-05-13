import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { UsersOnlineComponent } from '../users-online/users-online.component';


@Component({
  selector: 'app-messages',
  standalone: true, 
  imports: [CommonModule, FormsModule,UsersOnlineComponent], 
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit {
  messages: any[] = []; // Tous les messages
  filteredMessages: any[] = []; // Messages filtrés
  currentPage: number = 1; // Page actuelle
  totalPages: number = 1; // Nombre total de pages (à calculer si besoin)
  filterHashtag: string = ''; // Filtre hashtag(s)
  filterOwner: string = 'all'; // Filtre propriétaire
  sortCriteria: string = 'date'; // Critère de tri
  newCommentText: { [key: number]: string } = {}; // Texte des nouveaux commentaires
  currentUserId: number = 0; // ID de l'utilisateur actuel
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.currentUserId = Number(localStorage.getItem('userId')) ;
    this.fetchMessages();
  }

  fetchMessages(): void {
    const limit = 5;
    const url = `https://pedago.univ-avignon.fr:3140/messages?page=${this.currentPage}&limit=${limit}`;
  
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.messages = data;
        this.filteredMessages = [...this.messages];
        this.totalPages = Math.ceil(data.length / limit); // Calculer le nombre total de pages

        if (data.length < limit) {
          this.totalPages = this.currentPage;
        } else {
          // On suppose qu'il y a au moins une page de plus
          this.totalPages = Math.max(this.currentPage + 1, this.totalPages);
        }
        
        // Appliquer le tri dès que les messages sont chargés
        this.applySort();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des messages :', err);
      },
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchMessages();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchMessages();
    }
  }

  applyFilter(): void {
    // Découpe la saisie utilisateur en hashtags séparés, ignore les espaces vides
    const hashtags = this.filterHashtag
      .split(' ')
      .map(h => h.trim())
      .filter(h => h.length > 0);

    this.filteredMessages = this.messages.filter((message) => {
      // Filtrage par hashtags (tous les hashtags saisis doivent être présents)
      const matchesHashtag =
        hashtags.length === 0 ||
        hashtags.every(tag =>
          message.hashtags.some((h: string) => h.toLowerCase() === tag.toLowerCase())
        );

      // Filtrage par propriétaire
      const matchesOwner =
        this.filterOwner === 'all' ||
        (this.filterOwner === 'me' && message.createdBy === this.currentUserId) ||
        (this.filterOwner === 'others' && message.createdBy !== this.currentUserId);

      return matchesHashtag && matchesOwner;
    });
  }

  applySort() {
    if (this.sortCriteria === 'date') {
      this.filteredMessages.sort((a, b) => {
        // Format: "YYYY-MM-DD"
        const dateA = new Date(`${a.date} ${a.hour}`);
        const dateB = new Date(`${b.date} ${b.hour}`);
        return dateB.getTime() - dateA.getTime(); // Du plus récent au plus ancien
      });
    } else if (this.sortCriteria === 'likes') {
      this.filteredMessages.sort((a, b) => {
        // Si likes est undefined, considère-le comme 0
        const likesA = a.likes?.length || 0;
        const likesB = b.likes?.length || 0;
        return likesB - likesA; // Du plus populaire au moins populaire
      });
    } else if (this.sortCriteria === 'owner') {
      const currentUserId = Number(localStorage.getItem('userId'));
      
      // D'abord les messages de l'utilisateur courant, puis les autres par ordre alphabétique
      this.filteredMessages.sort((a, b) => {
        if (a.createdBy === currentUserId && b.createdBy !== currentUserId) {
          return -1;
        } else if (a.createdBy !== currentUserId && b.createdBy === currentUserId) {
          return 1;
        } else {
          // Même propriétaire, trier par nom
          return (a.createdByName || '').localeCompare(b.createdByName || '');
        }
      });
    }
  }

  addComment(messageId: number): void {
    const text = this.newCommentText[messageId]?.trim();
    if (!text) {
      alert("Le commentaire ne peut pas être vide.");
      return;
    }

    const url = `https://pedago.univ-avignon.fr:3140/messages/${messageId}/comments`;
    const body = {
      text: text,
      commentedBy: this.currentUserId,
    };

    this.http.post(url, body).subscribe({
      next: () => {
        // Ajoute le commentaire localement pour un affichage immédiat
        const message = this.messages.find((msg) => msg._id === messageId);
        if (message) {
          // Récupère l'avatar de l'utilisateur actuel depuis localStorage
          const userAvatar = localStorage.getItem('userAvatar') || '';
        

          message.comments.push({
            text: text,
            commentedBy: this.currentUserId,
            commentedByName: localStorage.getItem('userPseudo') || "Moi",
            commentedByAvatar: userAvatar,
            date: new Date().toISOString().split('T')[0],
            hour: new Date().toISOString().split('T')[1].split('.')[0],
          });
        }
        this.newCommentText[messageId] = '';
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du commentaire :', err);
      },
    });
  }
}