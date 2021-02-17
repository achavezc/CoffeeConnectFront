import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class LoteService {

  constructor(private http: HttpClient, private errorHandling: ErrorHandling) { }

  private url = `${host}Lote`;

  Generar(request: any) {
    let url = `${this.url}/Generar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }
}
