import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class FincaDocumentoAdjuntoService {

  constructor(private http: HttpClient, private errorHandling: ErrorHandling) { }

  private url = `${host}FincaDocumentoAdjunto`;

  SearchById(request: any) {
    let url = `${this.url}/ConsultarPorId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  SearchByFincaId(request: any) {
    let url = `${this.url}/ConsultarPorFincaId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }
  Eliminar(id: any) {
    let url = `${this.url}/Eliminar`;
    return this.http.post<any>(url, { FincaDocumentoAdjuntoId: id }).catch(this.errorHandling.handleError)
  }
}
