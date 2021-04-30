import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class FincaFotoGeoreferenciadaService {

  constructor(private http: HttpClient, private errorHandling: ErrorHandling) { }

  private url = `${host}FincaFotoGeoreferenciada`;

  SearchById(request: any) {
    let url = `${this.url}/ConsultarPorId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  SearchByFincaId(request: any) {
    let url = `${this.url}/ConsultarPorFincaId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }
}
