import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class CertificacionService {

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  private url = `${host}SocioFincaCertificacion`;


  SearchCertificacionById(request: any): Observable<any> {
    const url = `${this.url}/ConsultarPorSocioFincaId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
  Create(request: any): Observable<any> {
    const url = `${this.url}/Registrar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
  SearchById(pId: number): Observable<any> {
    const url = `${this.url}/ConsultarPorId`;
    return this.http.post<any>(url, { SocioFincaCertificacionId: pId }).catch(this.errorHandling.handleError);
  }

  DescargarArchivo(archivoVisual: String, pathFile: String): Observable<any> {
    const url = `${this.url}/DescargarArchivo`;
    return this.http.post<any>(url, { ArchivoVisual: archivoVisual, PathFile: pathFile}).catch(this.errorHandling.handleError);
  }



}
