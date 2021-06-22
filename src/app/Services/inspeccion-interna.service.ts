import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class InspeccionInternaService {

  private url = `${host}InspeccionInterna`;

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  Search(request: any): Observable<any> {
    const url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Create(file: any, request: any): Observable<any> {
    const url = `${this.url}/Registrar`;
    const headers = new HttpHeaders();
    headers.append('enctype', 'multipart/form-data');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('request', JSON.stringify(request));
    return this.http.post<any>(url, formData, { headers }).catch(this.errorHandling.handleError);
  }

  Update(file: any, request: any): Observable<any> {
    const url = `${this.url}/Actualizar`;
    const headers = new HttpHeaders();
    headers.append('enctype', 'multipart/form-data');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('request', JSON.stringify(request));
    return this.http.post<any>(url, formData, { headers }).catch(this.errorHandling.handleError);
  }

  SearchById(request: any): Observable<any> {
    const url = `${this.url}/ConsultarPorId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

}
