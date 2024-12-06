import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../services/property.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { BiddingService } from '../services/bidding-http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { MeasurementService } from '../services/measurement.service';

@Component({
  selector: 'app-auction-detail',
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule]
})
export class AuctionDetailComponent implements OnInit, OnDestroy {
  property: any;
  currentBid: number = 0;
  bidAmount: number = 0;
  pollSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private biddingService: BiddingService,
    private cdr: ChangeDetectorRef ,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private measurementService: MeasurementService
  ) {}

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.fetchProperty(propertyId);
      this.startPolling(propertyId);
    }
  }

  fetchProperty(propertyId: string): void {
    this.propertyService.getPropertyById(propertyId).subscribe(
      (data) => {
        this.property = data;
        this.currentBid = data.current_price;
        this.cdr.detectChanges();  // Trigger change detection
      },
      (error) => console.error('Error fetching property:', error)
    );
  }

  submitBid(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.refreshAndStoreToken();
    }

    if (this.bidAmount > this.currentBid) {
      const bidData = {
        property: this.property?.id,
        bid_amount: this.bidAmount
      };

      this.biddingService.submitBid(bidData).subscribe(
        (response) => {
          this.measurementService.endRecording('HTTP');
          this.snackBar.open('Bid submitted successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
          this.currentBid = this.bidAmount; // Optimistically update the current bid
          this.cdr.detectChanges();  // Trigger change detection
        },
        (error) => {
          console.error('Error submitting bid:', error);
          this.snackBar.open('Failed to submit bid. Please try again.', 'Close', {
            verticalPosition: 'top',
            duration: 3000
          });
        }
      );
    } else {
      this.snackBar.open('Bid amount must be higher than the current bid.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
    }
  }

  startPolling(propertyId: string): void {
    this.pollSubscription = interval(3000).subscribe(() => {
      this.propertyService.getPropertyById(propertyId).subscribe(
        (data) => {
          this.currentBid = data.current_price;
          this.cdr.detectChanges();  // Trigger change detection
        },
        (error) => console.error('Error polling property:', error)
      );
    });
  }

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }
}