import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable()
export class NotaIngresoProductoTerminadoAlmacenPlantaService {
  private url = `${host}NotaIngresoProductoTerminadoAlmacenPlanta`;

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) {
  }

  Registrar(id: number, username: string): Observable<any> {
    const url = `${this.url}/Registrar`;

    const body: any = {
      NotaIngresoProductoTerminadoAlmacenPlantaId: id,
      Usuario: username
    };
    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }

  Consultar(request: any): Observable<any> {
    const url = `${this.url}/Consultar`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  Resumen(request: any): Observable<any> {
    const url = `${this.url}/Resumen`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  

  Anular(NotaIngresoProductoTerminadoAlmacenPlantaId: number, usuario: string): Observable<any> {
    const url = `${this.url}/Anular`;
    let request = {
      NotaIngresoProductoTerminadoAlmacenPlantaId: NotaIngresoProductoTerminadoAlmacenPlantaId,
      Usuario: usuario
    }
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  ConsultarPorId(id: number): Observable<any> {
    const url = `${this.url}/ConsultarPorId`;

    const body: any = {
      NotaIngresoProductoTerminadoAlmacenPlantaId: id
    };
    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }
  actualizar(NotaIngresoProductoTerminadoAlmacenPlantaId: Number, usuario: string, almacenId: string): Observable<any> {
    const url = `${this.url}/Actualizar`;
    let request = {
      NotaIngresoProductoTerminadoAlmacenPlantaId: NotaIngresoProductoTerminadoAlmacenPlantaId,
      Usuario: usuario,
      AlmacenId: almacenId
    }
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

}