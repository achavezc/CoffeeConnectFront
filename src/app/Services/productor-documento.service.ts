import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';
import { IdsAccion } from './models/req-actualizar-lote';


@Injectable({
  providedIn: 'root'
})
export class ProductorDocumentoService {

  private url = `${host}ProductorDocumento`;

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  SearchByProducerId(id: any) {
    let url = `${this.url}/ConsultarPorProductorId`;
    return this.http.post<any>(url, { ProductorId: id }).catch(this.errorHandling.handleError)
  }
}
