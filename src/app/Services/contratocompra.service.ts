import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class ContratoCompraService {

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  private url = `${host}ContratoCompra`;
  

  Search(request: any): Observable<any> {
    const url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Create(request: any): Observable<any> {
    const url = `${this.url}/Registrar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Update(request: any): Observable<any> {
    const url = `${this.url}/Actualizar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarTrackingContratoPorContratoId(request: any): Observable<any> {
    const url = `${this.url}/ConsultarTrackingContratoPorContratoId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
  SearchById(request: any): Observable<any> {
    const url = `${this.url}/ConsultarPorId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Cancel(request: any): Observable<any> {
    const url = `${this.url}/Anular`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarTrackingContrato(request: any): Observable<any> {
    const url = `${this.url}/ConsultarTrackingContrato`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }


  ConsultarContratoAsignado(request: any): Observable<any> {
    const url = `${this.url}/ConsultarContratoAsignado`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }


  AssignCollection(request: any): Observable<any> {
    const url = `${this.url}/AsignarAcopio`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
}

