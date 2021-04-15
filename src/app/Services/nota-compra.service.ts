import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

import { ReqNotaCompraConsultar } from './models/req-notacompra-consulta.model';

@Injectable()
export class NotaCompraService {

  constructor(private http: HttpClient, private errorHandling: ErrorHandling) { }

  private url = `${host}NotaCompra`;

  Consultar(request: ReqNotaCompraConsultar): Observable<any> {
    let url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  Anular(pNotaCompraId: number, username: string) {
    let url = `${this.url}/Anular`;
    let request = {
      NotaCompraId: pNotaCompraId,
      Usuario: username
    }
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  SearchById(request: any): Observable<any> {
    let url = `${this.url}/ConsultarPorId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  Liquidar(request: any): Observable<any> {
    let url = `${this.url}/Liquidar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }
  Registrar(request: any): Observable<any> {
    let url = `${this.url}/Registrar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }
  Actualizar(request: any): Observable<any> {
    let url = `${this.url}/Actualizar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }
}
