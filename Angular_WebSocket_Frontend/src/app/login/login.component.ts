import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { CommonModule } from '@angular/common';  // Import CommonModule for ngIf
import { HttpClient } from '@angular/common/http';  // Import HttpClient
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],  // Add HttpClientModule here
})
export class LoginComponent {
  loginData = { username: "", password: "" };
  errorMessage = "";

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Check if the user is authenticated
    if (this.authService.isAuthenticated()) {
      // If authenticated, redirect to home
      this.router.navigate(['/home']);
    }
  }

  onSubmit() {
    // Log the loginData to check format before sending
    console.log("Submitting login data:", JSON.stringify(this.loginData));

    // Ensure username and password are provided
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Username and password are required.';
      return; // Exit the method if data is not valid
    }

    this.authService.login(this.loginData.username, this.loginData.password).subscribe(
      (response: any) => {
        // Store access and refresh tokens
        console.log('Login response:', response);
        this.authService.storeTokens(response.access, response.refresh);
        this.router.navigate(['/home']);
      },
      error => {
        console.error('Login error:', error);  // Log the error for debugging
        this.errorMessage = 'Invalid username or password';
      }
    );
  }
}