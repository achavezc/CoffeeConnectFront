import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class PrecioDiaRendimientoService {

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) { }

  private url = `${host}PrecioDiaRendimiento`;

  Consultar(request: any): Observable<any> {
    const url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Register(request: any): Observable<any> {
    const url = `${this.url}/Registrar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Cancel(request: any): Observable<any> {
    const url = `${this.url}/Anular`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  CheckPricePerformance(request: any): Observable<any> {
    const url = `${this.url}/CalcularPrecioDiaRendimiento`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultPerformancePercentage(request: any): Observable<any> {
    const url = `${this.url}/ConsultarPorcentajeRendimiento`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  CheckPriceDayPerformanceById(request: any): Observable<any> {
    const url = `${this.url}/ConsultarPrecioDiaRendimientoPorId`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  UpdatePriceDayPerformance(request: any): Observable<any> {
    const url = `${this.url}/ActualizarPrecioDiaRendimiento`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
}
