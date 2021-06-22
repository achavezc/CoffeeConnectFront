import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class NotaIngresoPlantaDocumentoAdjuntoService {

  private url = `${host}NotaIngresoPlantaDocumentoAdjunto`;

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

  SearchForPlantEntryNoteById(id: any) {
    let url = `${this.url}/ConsultarPorNotaIngresoPlantaId`;
    return this.http.post<any>(url, { NotaIngresoPlantaId: id }).catch(this.errorHandling.handleError)
  }

  // DownloadFile(id: any) {
  //   let url = `${this.url}/DescargarArchivo`;
  //   return this.http.post<any>(url, { ProductorId: id }).catch(this.errorHandling.handleError)
  // }

  SearchById(id: any) {
    let url = `${this.url}/ConsultarPorId`;
    return this.http.post<any>(url, { NotaIngresoPlantaDocumentoAdjuntoId: id }).catch(this.errorHandling.handleError)
  }

  Delete(id: any) {
    let url = `${this.url}/Eliminar`;
    return this.http.post<any>(url, { NotaIngresoPlantaDocumentoAdjuntoId: id }).catch(this.errorHandling.handleError)
  }
}
