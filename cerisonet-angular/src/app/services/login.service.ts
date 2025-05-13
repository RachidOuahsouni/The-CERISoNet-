import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LoginService {
  private apiUrl = 'https://pedago.univ-avignon.fr:3140/login'; // URL de l'API de connexion

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const body = `login=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    return this.http.post(this.apiUrl, body, { headers, responseType: 'text' });
  }
}