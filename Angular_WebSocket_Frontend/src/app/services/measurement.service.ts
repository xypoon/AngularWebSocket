import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private startTime: number | null = null;
  private records: string[] = ["RequestType,StartTime,EndTime,Latency"];
  private apiUrl: string = 'http://localhost:8000/api/property/latency';

  // WebSocket Time Measurement
  private client_ts: number | null = null;
  private client_ack_ts: number | null = null;

  constructor(private http: HttpClient) { }

  // Start timing the request
  startRecording() {
    this.startTime = Date.now();
  }

  // Stop timing, calculate latency, and store the result
  endRecording(requestType: string = 'HTTP') {
    if (this.startTime === null) {
      console.warn("Start time not set. Call startRecording() before endRecording().");
      return;
    }

    const endTime = Date.now();
    const latency = (endTime - this.startTime).toFixed(2);
    console.log(`Latency for ${requestType}: ${latency}ms`);

    // Record the result
    this.records.push(`${requestType},${this.startTime},${endTime},${latency}`);

    this.http.post(this.apiUrl, {
      request_type: requestType,
      startTime: this.startTime,
      endTime: endTime,
      latency: latency
    }).subscribe();

    this.startTime = null; // Reset the start time for the next measurement
  }


  startWebSocketRecording() {
    this.client_ts = Date.now();
    console.log("Client start time: " + this.client_ts);
  }

  setWebSocketEndTime() {
    this.client_ack_ts = Date.now();
  }

  endWebSocketRecording(requestType: string = 'WebSocket', message: any) {
    if (this.client_ts === null) {
        console.warn("Start time not set. Call startRecording() before endRecording().");
        return;
    }

    // Convert server timestamps to epoch time in milliseconds
    const serverTs = new Date(message.server_ts).getTime(); // Convert ISO to epoch ms
    const serverAckTs = new Date(message.server_ack_ts).getTime(); // Convert ISO to epoch ms

    if (serverTs === null || serverAckTs === null) {
        console.warn("Server times not properly set.");
        return;
    }

    // Calculate latency
    if (this.client_ack_ts === null || this.client_ts === null) {
        console.warn("Client times not properly set.");
        return;
    }
    const latency = (serverAckTs - serverTs) - (this.client_ack_ts - this.client_ts) / 2;

    // Debug all times
    console.log(`Client start time: ${this.client_ts}`);
    console.log(`Client ack time: ${this.client_ack_ts}`);
    console.log(`Server start time: ${serverTs}`);
    console.log(`Server ack time: ${serverAckTs}`);
    console.log(`Latency for ${requestType}: ${latency}ms`);

    // Send latency data to the server
    this.http.post(this.apiUrl, {
        request_type: requestType,
        startTime: this.client_ts,
        endTime: this.client_ack_ts,
        latency: latency
    }).subscribe();

    // Reset the timestamps for the next measurement
    this.client_ts = null;
    this.client_ack_ts = null;
}
}
