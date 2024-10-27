import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent},  // Protect landing with AuthGuard
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
