import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserName(): string {
    return localStorage.getItem('nombre') || 'Usuario';
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}