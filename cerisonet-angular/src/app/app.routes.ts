import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MessagesComponent } from './components/messages/messages.component';

export const routes: Routes = [
    
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'messages', component: MessagesComponent }
];
