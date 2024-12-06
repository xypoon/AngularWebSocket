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

  // WebsSocket Time Measurement
  private client_ts: number | null = null;
  private server_ts: number | null = null;
  private server_ack_ts: number | null = null;

  constructor(private http: HttpClient) { }

  // Start timing the request
  startRecording() {
    this.startTime = Date.now();
  }

  startWebSocketRecording() {
    this.client_ts = Date.now();
  }

  // Stop timing, calculate latency, and store the result
  endRecording(requestType: string = 'HTTP') {
    if (this.startTime === null) {
      console.warn("Start time not set. Call startRecording() before endRecording().");
      return;
    }

    const endTime = Date.now();
    const latency = endTime - this.startTime;

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

  setServerTime(server_ts: number, server_ack_ts: number) { 
    this.server_ts = server_ts;
    this.server_ack_ts = server_ack_ts;
  }

  endWebSocketRecording(requestType: string = 'WebSocket') {
    if (this.client_ts === null) {
      console.warn("Start time not set. Call startRecording() before endRecording().");
      return;
    }

    const client_ack_ts = Date.now();
    if (this.client_ts === null || this.server_ts === null || this.server_ack_ts === null) {
      console.warn("Server times not set. Call setServerTime() before endWebSocketRecording().");
      return;
    }
    const latency = (this.server_ack_ts - this.server_ts) - (client_ack_ts - this.client_ts) / 2;

    // Record the result
    this.records.push(`${requestType},${this.client_ts},${client_ack_ts},${latency}`);

    this.http.post(this.apiUrl, {
      request_type: requestType,
      startTime: this.client_ts,
      endTime: client_ack_ts,
      latency: latency
    }).subscribe();

    this.client_ts = null; // Reset the start time for the next measurement
  }

  // Save all records to a CSV file
  saveResultsToFile() {
    const blob = new Blob([this.records.join('\n')], { type: 'text/csv' });
    saveAs(blob, 'latency_measurements.csv');
  }
}
