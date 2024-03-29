import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  private url = `${host}Empresa`;
  private urlProv = `${host}EmpresaProveedoraAcreedora`;

  Consultar(request: any): Observable<any> {
    const url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarEmpresaProv(request: any): Observable<any> {
    const url = `${this.urlProv}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
}
