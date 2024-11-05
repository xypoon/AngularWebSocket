import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuctionListComponent } from './auction-list/auction-list.component';
import { AuctionDetailComponent } from './auction-detail/auction-detail.component';
import { AuthGuard } from './auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'auctions', component: AuctionListComponent }, // List of available property auctions
  { path: 'auction/:id', component: AuctionDetailComponent }, // Auction detail page
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
