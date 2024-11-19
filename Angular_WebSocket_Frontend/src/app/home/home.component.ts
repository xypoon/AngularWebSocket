import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuctionListComponent } from '../auction-list/auction-list.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [AuctionListComponent]
})
export class HomeComponent {

  constructor(private router: Router, private authService: AuthService) {}

  logout() {
    this.authService.clearTokens();
  }
}
