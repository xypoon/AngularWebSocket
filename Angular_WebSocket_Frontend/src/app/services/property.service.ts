import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  //private apiUrl = 'http://localhost:8000/api/property';
  private apiUrl: string;

  constructor(private http: HttpClient) {
    const protocol = window.location.protocol; // "http:" or "https:"
    const host = window.location.hostname; // e.g., "localhost"
    const apiPort = protocol === 'https:' ? 443 : 8000; // Replace with your backend's TLS and non-TLS ports
    this.apiUrl = `${protocol}//${host}:${apiPort}/api/property`;
    console.log('Property API Endpoint:', this.apiUrl); // For debugging
  }

  getProperties(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/properties`);
  }

  getPropertyById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/properties/${id}`);
  }

  getAuctions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auctions`);
  }

  getAuctionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auctions/${id}`);
  }

  getPropertySpecsById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/property_specifications/?id=${id}`);
  }
}
