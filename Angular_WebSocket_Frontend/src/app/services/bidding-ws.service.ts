import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BiddingWsService {

  private socket$!: WebSocketSubject<any>;

  private WS_URL: string;
  private token: string;

  constructor(private authService: AuthService) {
    this.token = this.authService.getAccessToken() || '';
    const protocol = window.location.protocol; // "http:" or "https:"
    const host = window.location.hostname; // e.g., "localhost"
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    const apiPort = protocol === 'https:' ? 443 : 8000; // Replace with your backend's TLS and non-TLS ports
    this.WS_URL = `${wsProtocol}//${host}:${apiPort}/ws/bid/`;

    console.log("WebSocket URL: ", this.WS_URL);
  }

  // Create a custom WebSocketSubject with binaryType set to 'arraybuffer'
  private createWebSocketSubject(url: string): WebSocketSubject<any> {
    const config: WebSocketSubjectConfig<any> = {
      url: url,
      openObserver: {
        next: () => {
          console.log('WebSocket connection established');
        }
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket connection closed');
        }
      },
      binaryType: 'arraybuffer', // Set binaryType to 'arraybuffer'
      deserializer: (e: MessageEvent) => {
        if (e.data instanceof ArrayBuffer) {
          return e.data;
        } else {
          return JSON.parse(e.data);
        }
      }
    };

    const socket = new WebSocket(url);
    socket.binaryType = 'arraybuffer';

    return new WebSocketSubject(config);
  }

  // Connect to the WebSocket server
  connect(property: string): void {
    if (!this.socket$ || this.socket$.closed) {
      const url = this.WS_URL + property + '/?token=' + this.token;
      this.socket$ = this.createWebSocketSubject(url);
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
