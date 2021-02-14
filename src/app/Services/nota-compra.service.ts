import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class NotaCompraService {

  constructor(private http: HttpClient, private errorHandling: ErrorHandling) { }

  private url = `${host}NotaCompra`;

  // exportPDFNotaCompra(id: number): Observable<ArrayBuffer> {
  //   let url = `${this.url}/GenerarPDFPost?id=${id}`;
  //   // let body: any = {
  //   //   GuiaRecepcionMateriaPrimaId: id
  //   // }
  //   // return this.http.get(url, { responseType: 'blob' }).catch(this.errorHandling.handleError);
  //   return this.http.get(url, { responseType: 'arraybuffer' });
  // }
}
