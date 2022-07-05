import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
}) 
export class KardexPlantaService {

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  private url = `${host}KardexPlanta`;

  Consultar(request: any): Observable<any> {
    const url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  
  Registrar(request: any): Observable<any> {
    const url = `${this.url}/Registrar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Actualizar(request: any): Observable<any> {
    const url = `${this.url}/Actualizar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
  ConsultarPorId(request: any): Observable<any> {
    const url = `${this.url}/ConsultarPorId`;
    const body: any = {
      KardexPlantaId: request
    };
    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }

  Anular(request: any, usuario :String): Observable<any> {
    const url = `${this.url}/Anular`;
    const body: any = {
      KardexPlantaId: Number(request),
      usuario: usuario
    };
    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }
}