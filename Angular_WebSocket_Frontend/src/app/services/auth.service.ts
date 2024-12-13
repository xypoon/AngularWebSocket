// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private apiUrl = 'http://localhost:8000/api/auth/token/';
  private apiUrl: string;

  constructor(private http: HttpClient, private router: Router) { 
    const protocol = window.location.protocol; // "http:" or "https:"
    const host = window.location.hostname; // e.g., "localhost"
    const apiPort = protocol === 'https:' ? 443 : 8000; // Replace with your backend's TLS and non-TLS ports
    this.apiUrl = `${protocol}//${host}:${apiPort}/api/auth/token/`;
    console.log('Auth API Endpoint:', this.apiUrl); // For debugging
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { username, password });
  }

  storeTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    console.log('Logged out');
    // Optionally redirect to login page or homepage
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        // Check if the token has expired
        return decodedToken.exp > currentTime;
      } catch (error) {
        // Token is invalid
        return false;
      }
    }
    return false; // No token found
  }

  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    return this.http.post('http://localhost:8000/api/auth/token/refresh/', { refresh });
  }

  refreshAndStoreToken(): void {
    this.refreshToken().subscribe(
      (response: any) => {
        const { access, refresh } = response;
        this.storeTokens(access, refresh);
        console.log('Token refreshed');
      },
      (error) => {
        console.error('Failed to refresh token', error);
        this.clearTokens();
        this.router.navigate(['/login']);
      }
    );
  }
}
