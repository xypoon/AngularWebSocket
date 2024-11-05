import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../property.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-auction-detail',
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class AuctionDetailComponent implements OnInit {
  property: any;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propertyService.getPropertyById(id).subscribe(
        (data) => this.property = data,
        (error) => console.error('Error fetching property details:', error)
      );
    }
  }
}
