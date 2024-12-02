import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BiddingWsService {

  private socket$!: WebSocketSubject<any>;

  private readonly WS_URL = 'ws://localhost:8000/ws/bid/';
  private token: string;

  constructor(private authService: AuthService) {
    this.token = this.authService.getAccessToken() || '';
  }

  // Connect to the WebSocket server
  connect(property : string): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket(this.WS_URL + property + '/?token=' + this.token);
    }
  }

  // Send a message (e.g., a bid) to the server
  sendMessage(message: any): void {
    if (this.socket$) {
      this.socket$.next(message);
    } else {
      console.error('WebSocket connection is not established.');
    }
  }

  // Listen for incoming messages (e.g., updates or bids from other users)
  onMessage(): Observable<any> {
    if (!this.socket$) {
      throw new Error('WebSocket connection is not established.');
    }
    return this.socket$.asObservable();
  }

  // Close the WebSocket connection
  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
