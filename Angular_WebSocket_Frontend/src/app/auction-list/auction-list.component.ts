import { Component, OnInit, OnDestroy } from '@angular/core';
import { PropertyService } from '../services/property.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Property, Auction } from '../models/auction.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-auction-list',
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class AuctionListComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  auctions: Auction[] = [];
  combinedData: any[] = [];
  countdowns: { [key: number]: string } = {};
  timerSubscription!: Subscription;

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    // Fetch properties
    this.propertyService.getProperties().subscribe(
      (data: Property[]) => {
        this.properties = data;
        this.combineData();
      },
      (error) => console.error('Error fetching properties:', error)
    );

    // Fetch auctions
    this.propertyService.getAuctions().subscribe(
      (data: Auction[]) => {
        this.auctions = data;
        this.combineData();
      },
      (error) => console.error('Error fetching auctions:', error)
    );

    // Start the countdown
    this.startCountdown();
  }

  ngOnDestroy(): void {
    // Ensure the interval subscription is cleaned up
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  combineData(): void {
    if (this.properties.length && this.auctions.length) {
      this.combinedData = this.auctions.map(auction => {
        const property = this.properties.find(prop => prop.id === auction.property);
        return { ...auction, property };
      });
    }
  }

  startCountdown(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      const now = new Date().getTime();
      this.combinedData.forEach((item) => {
        const endTime = new Date(item.end_time).getTime();
        const timeLeft = endTime - now;

        if (timeLeft > 0) {
          this.countdowns[item.property.id] = this.formatTimeLeft(timeLeft);
        } else {
          this.countdowns[item.property.id] = 'Auction Ended';
        }
      });
    });
  }

  formatTimeLeft(timeLeft: number): string {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  logItem(item: any): string {
    console.log(item);
    return ''; // Return an empty string to avoid displaying it in the UI
  }
}
