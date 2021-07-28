import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable()
export class MaestroService {
  private url = `${host}Maestro`;

  constructor(private http: HttpClient, private errorHandling: ErrorHandling) { }

  obtenerMaestros(codigoTabla: string) {
    const url = `${this.url}/Consultar`;

    const body: any = {
      CodigoTabla: codigoTabla,
      EmpresaId: 1
    };

    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }

  ConsultarDepartamento(request: any): Observable<any> {
    const url = `${this.url}/ConsultarDepartamento`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarProductoPrecioDia(request: any): Observable<any> {
    const url = `${this.url}/ConsultarProductoPrecioDia`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }


  ConsultarDepartamentoAsync(request: any) {
    const url = `${this.url}/ConsultarDepartamento`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarProvincia(request: any): Observable<any> {
    const url = `${this.url}/ConsultarProvincia`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarProvinciaAsync(request: any) {
    const url = `${this.url}/ConsultarProvincia`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarDistrito(request: any): Observable<any> {
    const url = `${this.url}/ConsultarDistrito`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarDistritoAsync(request: any) {
    const url = `${this.url}/ConsultarDistrito`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarZona(request: any): Observable<any> {
    const url = `${this.url}/ConsultarZona`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarZonaAsync(request: any) {
    const url = `${this.url}/ConsultarZona`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  GetPais(): Observable<any> {
    const url = `${this.url}/ConsultarPais`;
    return this.http.post<any>(url, {}).catch(this.errorHandling.handleError);
  }

  ConsultarPaisAsync() {
    const url = `${this.url}/ConsultarPais`;
    return this.http.post<any>(url, {}).catch(this.errorHandling.handleError);
  }

  CheckPriceDayPerformance(request: any) {
    const url = `${this.url}/ConsultarPrecioDiaRendimiento`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

}