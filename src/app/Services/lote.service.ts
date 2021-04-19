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

  Consultar(request: any) {
    let url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  Anular(request: any) {
    let url = `${this.url}/Anular`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  SearchDetailsById(request: any): Observable<any> {
    let url = `${this.url}/ConsultarDetallePorId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  Update(request: any) {
    let url = `${this.url}/Actualizar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  ConsultarDetallePorLoteId(request: any) {
    let url = `${this.url}/ConsultarLoteDetallePorLoteId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }

  ConsultarEtiquetasLote(request: any) {
    let url = `${this.url}/ConsultarEtiquetasLote`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError)
  }
  
  ActualizarAnalisisCalidad(request: any): Observable<any> {
    const url = `${this.url}/ActualizarAnalisisCalidad`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
}
