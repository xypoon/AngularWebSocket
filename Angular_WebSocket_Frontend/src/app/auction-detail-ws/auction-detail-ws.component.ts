import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MeasurementService } from '../services/measurement.service';
import { BiddingWsService } from '../services/bidding-ws.service';
import { PropertyService } from '../services/property.service';
import * as pako from 'pako';

@Component({
  selector: 'app-auction-detail-ws',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './auction-detail-ws.component.html',
  styleUrl: './auction-detail-ws.component.css'
})
export class AuctionDetailWsComponent implements OnInit, OnDestroy {
  property: any;
  currentBid: number = 0;
  bidAmount: number = 0;
  wsSubscription: Subscription | null = null;
  propertySpecs: any;

  constructor(
    private route: ActivatedRoute,
    private biddingWsService: BiddingWsService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private measurementService: MeasurementService,
    private propertyService: PropertyService
  ) { }

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.propertyService.getPropertySpecsById(propertyId).subscribe(
        (data) => {
          this.propertySpecs = data[0];
          console.log('Property specifications:', this.propertySpecs);
        },
        (error) => console.error('Error fetching property specifications:', error)
      );
      this.connectToWebSocket(propertyId);
    }
  }

  connectToWebSocket(propertyId: string): void {
    // Initialize WebSocket connection
    this.biddingWsService.connect(propertyId);

    // Subscribe to incoming messages
    this.wsSubscription = this.biddingWsService.onMessage().subscribe(
      (message: ArrayBuffer) => {
        const byteArray = new Uint8Array(message);
        const decompressedData = pako.ungzip(byteArray, { to: 'string' });
        console.log('Received message:', decompressedData);
        let messageJSON = JSON.parse(decompressedData);
        this.measurementService.setWebSocketEndTime();
        if (messageJSON.type === 'init') {
          // Initialize property details
          this.property = messageJSON.property;
          this.currentBid = messageJSON.property.current_price;
          this.cdr.detectChanges(); // Trigger change detection
          console.log('Property details initialized:', this.property);
          console.log('Current bid:', this.currentBid);
        } else {
          // Update the current bid
          console.log('Received new bid:', messageJSON.bid_amount);
          console.log(messageJSON);
          this.measurementService.endWebSocketRecording('WebSocket', messageJSON);
          this.currentBid = messageJSON.bid_amount;
          this.cdr.detectChanges(); // Trigger change detection
        }
      },
      (error) => console.error('WebSocket error:', error)
    );
  }

  submitBid(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.refreshAndStoreToken();
    }

    if (this.bidAmount > this.currentBid) {
      const bidData = {
        property: this.property?.id,
        bid_amount: this.bidAmount,
        user_id: this.authService.getAccessToken,
      };

      console.log(bidData);

      // Send bid through WebSocket
      this.measurementService.startWebSocketRecording();
      this.biddingWsService.sendMessage(bidData);
      this.snackBar.open('Bid submitted successfully!', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
      this.currentBid = this.bidAmount; // Optimistically update the current bid
      this.cdr.detectChanges(); // Trigger change detection
    } else {
      this.snackBar.open('Bid amount must be higher than the current bid.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.biddingWsService.disconnect();
  }
}