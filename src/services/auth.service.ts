import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // CAMBIO IMPORTANTE
  private apiUri = '/api';

  httpOptions = new HttpHeaders().set(
    'Content-Type',
    'application/json'
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: any): Observable<any> {

    // CAMBIO IMPORTANTE
    return this.http.post<any>(
      this.apiUri + '/login',
      credentials,
      { headers: this.httpOptions }
    );
  }

  register(data: any): Observable<any> {

    // CAMBIO IMPORTANTE
    return this.http.post<any>(
      this.apiUri + '/signup',
      data,
      { headers: this.httpOptions }
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}