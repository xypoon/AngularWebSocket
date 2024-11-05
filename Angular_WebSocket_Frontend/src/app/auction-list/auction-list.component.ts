import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../property.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-auction-list',
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class AuctionListComponent implements OnInit {
  properties: any[] = [];

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.propertyService.getProperties().subscribe(
      (data) => this.properties = data,
      (error) => console.error('Error fetching properties:', error)
    );
  }
}
