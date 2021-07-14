import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class AduanaDocumentoAdjuntoService {

  private url = `${host}AduanaDocumentoAdjunto`;

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  Create(request: any) {
    let url = `${this.url}/Registrar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  Update(request: any) {
    let url = `${this.url}/Actualizar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  ConsultarPorAduanaId(id: any) {
    let url = `${this.url}/ConsultarPorAduanaId`;
    return this.http.post<any>(url, { AduanaId: id }).catch(this.errorHandling.handleError)
  }

  // DownloadFile(id: any) {
  //   let url = `${this.url}/DescargarArchivo`;
  //   return this.http.post<any>(url, { ProductorId: id }).catch(this.errorHandling.handleError)
  // }

  SearchById(id: any) {
    let url = `${this.url}/ConsultarPorId`;
    return this.http.post<any>(url, { AduanaDocumentoAdjuntoId: id }).catch(this.errorHandling.handleError)
  }

  Delete(id: any) {
    let url = `${this.url}/Eliminar`;
    return this.http.post<any>(url, { AduanaDocumentoAdjuntoId: id }).catch(this.errorHandling.handleError)
  }
}
