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

  // La API usa 'access-token', NO 'Authorization: Bearer'
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'access-token': token || ''
    });
  }

  // GET - obtener todas (sin token, la API no lo exige)
  getAllRecetasData(): Observable<any> {
    return this.http.get<any>(this.apiUri);
  }

  // GET - obtener una
  getOneReceta(id: any): Observable<any> {
    return this.http.get<any>(`${this.apiUri}/${id}`);
  }

  // POST - requiere token
  newReceta(data: any): Observable<any> {
    return this.http.post<any>(this.apiUri, data, { headers: this.getHeaders() });
  }

  // PUT - requiere token + admin
  updateReceta(id: any, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUri}/${id}`, data, { headers: this.getHeaders() });
  }

  // DELETE - requiere token
  deleteReceta(id: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUri}/${id}`, { headers: this.getHeaders() });
  }
}