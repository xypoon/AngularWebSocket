import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent {
  constructor(private router: Router) {}

  ngOnInit() {
    // Optionally, you could navigate here if not using redirects in routing
    this.router.navigate(['/login']);
  }
}