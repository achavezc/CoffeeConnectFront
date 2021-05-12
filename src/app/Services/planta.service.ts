import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class PlantaService {

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  private url = `${host}NotaIngresoPlanta`;

  Consultar(request: any): Observable<any> {
    const url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Anular(request: any): Observable<any> {
    const url = `${this.url}/Anular`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
  
  Registrar(request: any): Observable<any> {
    const url = `${this.url}/RegistrarPesado`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Actualizar(request: any): Observable<any> {
    const url = `${this.url}/ActualizarPesado`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
  ConsultarPorId(request: any): Observable<any> {
    const url = `${this.url}/ConsultarPorId`;
    const body: any = {
      OrdenServicioControlCalidadId: request
    };
    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }
  
  ActualizarAnalisisCalidad(request: any): Observable<any> {
    const url = `${this.url}/ActualizarAnalisisCalidad`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
}
