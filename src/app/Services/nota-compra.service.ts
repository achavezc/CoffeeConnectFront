import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

import { ReqNotaCompraConsultar } from './models/req-notacompra-consulta';

@Injectable()
export class NotaCompraService {

  constructor(private http: HttpClient, private errorHandling: ErrorHandling) { }

  private url = `${host}NotaCompra`;

  Consultar(request: ReqNotaCompraConsultar): Observable<any> {
    let url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }
}
