import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bid } from '../models/auction.model';
import { MeasurementService } from './measurement.service';

@Injectable({
  providedIn: 'root',
})
export class BiddingService {
  private apiUrl = 'http://localhost:8000/api/property/bids/';

  constructor(private http: HttpClient, private measurementService : MeasurementService) {}

  submitBid(bid: Partial<Bid>): Observable<Bid> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`, // Assumes JWT token stored in localStorage
    });
    this.measurementService.startRecording();
    return this.http.post<Bid>(this.apiUrl, bid, { headers });
  }
}
