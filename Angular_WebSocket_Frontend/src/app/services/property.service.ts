import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = 'http://localhost:8000/api/property';

  constructor(private http: HttpClient) {}

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
}
