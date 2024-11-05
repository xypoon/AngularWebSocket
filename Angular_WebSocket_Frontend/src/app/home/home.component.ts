import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuctionListComponent } from '../auction-list/auction-list.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [AuctionListComponent]
})
export class HomeComponent {

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
