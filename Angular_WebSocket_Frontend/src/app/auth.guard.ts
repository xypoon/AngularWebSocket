import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth.service'; // Ensure you have an AuthService
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    if (environment.bypassAuth) {
      console.log('AuthGuard#canActivate called: BYPASSING AUTH');
      return true;
    } else {
      console.log('AuthGuard#canActivate called:', this.authService.isAuthenticated());
      if (this.authService.isAuthenticated()) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    }
  }
}
