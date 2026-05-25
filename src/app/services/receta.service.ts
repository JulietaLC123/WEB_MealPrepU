import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {

  apiUri = '/api/recetas';

  constructor(private http: HttpClient) {}

  // HEADERS CON TOKEN
  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // GET - obtener todas
  getAllRecetasData(): Observable<any> {

    return this.http.get<any>(
      this.apiUri,
      {
        headers: this.getHeaders()
      }
    );
  }

  // GET - obtener una
  getOneReceta(id: any): Observable<any> {

    return this.http.get<any>(
      `${this.apiUri}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // POST
  newReceta(data: any): Observable<any> {

    return this.http.post<any>(
      this.apiUri,
      data,
      {
        headers: this.getHeaders()
      }
    );
  }

  // PUT
  updateReceta(id: any, data: any): Observable<any> {

    return this.http.put<any>(
      `${this.apiUri}/${id}`,
      data,
      {
        headers: this.getHeaders()
      }
    );
  }

  // DELETE
  deleteReceta(id: any): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUri}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
} 