import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class ProductorFincaService {

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) { }

  private url = `${host}ProductorFinca`;

  Create(request: any): Observable<any> {
    const url = `${this.url}/Registrar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Update(request: any): Observable<any> {
    const url = `${this.url}/Actualizar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  SearchProducerById(request: any): Observable<any> {
    const url = `${this.url}/ConsultarPorProductorId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  SearcById(request: any): Observable<any> {
    const url = `${this.url}/ConsultarPorId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

}
