import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MeasurementService } from '../services/measurement.service';
import { BiddingWsService } from '../services/bidding-ws.service';

@Component({
  selector: 'app-auction-detail-ws',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './auction-detail-ws.component.html',
  styleUrl: './auction-detail-ws.component.css'
})
export class AuctionDetailWsComponent implements OnInit, OnDestroy  {
  property: any;
  currentBid: number = 0;
  bidAmount: number = 0;
  wsSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private biddingWsService: BiddingWsService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private measurementService: MeasurementService
  ) {}

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.connectToWebSocket(propertyId);
    }
  }

  connectToWebSocket(propertyId: string): void {
    // Initialize WebSocket connection
    this.biddingWsService.connect(propertyId);

    // Subscribe to incoming messages
    this.wsSubscription = this.biddingWsService.onMessage().subscribe(
      (message) => {
        if (message.type === 'init') {
          // Initialize property details
          this.property = message.property;
          this.currentBid = message.property.current_price;
          this.cdr.detectChanges(); // Trigger change detection
          console.log('Property details initialized:', this.property);
          console.log('Current bid:', this.currentBid);
        } else if (message.type === 'bid_update') {
          // Update the current bid
          this.currentBid = message.current_price;
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