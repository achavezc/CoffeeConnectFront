import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable()
export class NotaIngresoAlmacenService {
  private url = `${host}NotaIngresoAlmacen`;

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  enviarAlmacen(id: number): Observable<any> {
    const url = `${this.url}/Registrar`;

    const body: any = {
      GuiaRecepcionMateriaPrimaId: id,
      Usuario: "mruizb"
    };
    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }

  Consultar(request: any): Observable<any> {
    const url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Anular(notaIngresoAlmacenId: number, usuario: string): Observable<any> {
    const url = `${this.url}/Anular`;
    let request = {
      NotaIngresoAlmacenId: notaIngresoAlmacenId,
      Usuario: usuario
    }
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

}