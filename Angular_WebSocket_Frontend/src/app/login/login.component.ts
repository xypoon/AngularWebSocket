import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { CommonModule } from '@angular/common';  // Import CommonModule for ngIf
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
import { HttpClient } from '@angular/common/http';  // Import HttpClient
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule, HttpClientModule],  // Add HttpClientModule here
})
export class LoginComponent {
  loginData = { username: "", password: "" };
  errorMessage = "";

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    // Log the loginData to check format before sending
    console.log("Submitting login data:", JSON.stringify(this.loginData));

    // Ensure username and password are provided
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Username and password are required.';
      return; // Exit the method if data is not valid
    }

    this.http.post('http://localhost:8000/api/login/', this.loginData).subscribe(
      (response: any) => {
        // Store token or session data (adjust as per your backend)
        localStorage.setItem('token', response.token);
        this.router.navigate(['/home']);
      },
      error => {
        console.error('Login error:', error);  // Log the error for debugging
        this.errorMessage = 'Invalid username or password';
      }
    );
  }
}
