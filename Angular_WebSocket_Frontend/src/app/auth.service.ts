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
  private apiUrl = 'http://localhost:8000/api/auth/token/';
  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { username, password });
  }

  storeTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    // post request to http://127.0.0.1:8000/api/property/latency to store dummy latency of login
    this.http.post('http://localhost:8000/api/property/latency', { request_type: 'HTTP', startTime: Date.now(), endTime: Date.now() + 1, latency: 1 }).subscribe();
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
}
