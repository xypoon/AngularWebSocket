import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';


@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private startTime: number | null = null;
  private records: string[] = ["RequestType,StartTime,EndTime,Latency"];

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
    const latency = endTime - this.startTime;

    // Record the result
    this.records.push(`${requestType},${this.startTime},${endTime},${latency}`);
    this.startTime = null; // Reset the start time for the next measurement
  }

  // Save all records to a CSV file
  saveResultsToFile() {
    const blob = new Blob([this.records.join('\n')], { type: 'text/csv' });
    saveAs(blob, 'latency_measurements.csv');
  }
}
