import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BiddingWsService {

  private socket$!: WebSocketSubject<any>;

  //private readonly WS_URL = 'ws://localhost:8000/ws/bid/';
  private WS_URL: string;
  private token: string;

  constructor(private authService: AuthService) {
    this.token = this.authService.getAccessToken() || '';
    const protocol = window.location.protocol; // "http:" or "https:"
    const host = window.location.hostname; // e.g., "localhost"
    // Use wss:// for HTTPS (secure) and ws:// for HTTP (non-secure)
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

    // Define the WebSocket URL dynamically based on the protocol
    const apiPort = protocol === 'https:' ? 443 : 8000; // Replace with your backend's TLS and non-TLS ports
    this.WS_URL = `${wsProtocol}//${host}:${apiPort}/ws/bid/`;

    console.log("WebSocket URL: ", this.WS_URL);
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
