import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {

  apiUri = '/api/recetas';
  httpOptions = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  // GET - obtener todas las recetas
  getAllRecetasData(): Observable<any> {
    return this.http.get<any>(this.apiUri);
  }

  // GET - obtener una receta por id
  getOneReceta(id: any): Observable<any> {
    return this.http.get<any>(
      this.apiUri + '/' + id,
      { headers: this.httpOptions }
    );
  }

  // POST - crear nueva receta
  newReceta(data: any): Observable<any> {
    return this.http.post<any>(
      this.apiUri,
      data,
      { headers: this.httpOptions }
    );
  }

  // PUT - actualizar receta
  updateReceta(id: any, data: any): Observable<any> {
    return this.http.put<any>(
      this.apiUri + '/' + id,
      data,
      { headers: this.httpOptions }
    );
  }

  // DELETE - eliminar receta
  deleteReceta(id: any) {
    return this.http.delete<any>(
      this.apiUri + '/' + id,
      { headers: this.httpOptions }
    );
  }
}
