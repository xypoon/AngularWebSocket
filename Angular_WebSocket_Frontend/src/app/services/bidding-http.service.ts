import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bid } from '../models/auction.model';
import { MeasurementService } from './measurement.service';

@Injectable({
  providedIn: 'root',
})
export class BiddingService {
  //private apiUrl = 'http://localhost:8000/api/property/bids/';
  private apiUrl: string;

  constructor(private http: HttpClient, private measurementService : MeasurementService) {
    const protocol = window.location.protocol; // "http:" or "https:"
    const host = window.location.hostname; // e.g., "localhost"
    const apiPort = protocol === 'https:' ? 443 : 8000; // Replace with your backend's TLS and non-TLS ports
    this.apiUrl = `${protocol}//${host}:${apiPort}/api/property/bids/`;
    console.log('Bid HTTP API Endpoint:', this.apiUrl); // For debugging
  }

  submitBid(bid: Partial<Bid>): Observable<Bid> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`, // Assumes JWT token stored in localStorage
    });
    this.measurementService.startRecording();
    return this.http.post<Bid>(this.apiUrl, bid, { headers });
  }
}
