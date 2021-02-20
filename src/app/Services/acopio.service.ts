import {Injectable} from '@angular/core';
import {host} from '../shared/hosts/main.host';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {ErrorHandling} from '../shared/util/error-handling';
import { ReqRegistrarPesado } from './models/req-registrar-pesado';
import { ReqActualizarPesado } from './models/req-actualizar-pesado';

export class FiltrosMateriaPrima {
  Numero: string;
  NombreRazonSocial: string;
  TipoDocumentoId: string;
  NumeroDocumento: string;
  ProductoId: string;
  CodigoSocio: string;
  EstadoId: string;
  FechaInicio: Date;
  FechaFin: Date;
}
export class FiltrosProveedor
{
  TipoProveedorId: string;
  NombreRazonSocial: string;
  TipoDocumentoId: string;
  NumeroDocumento: string;
  CodigoSocio: string;
}
@Injectable()
export class AcopioService {
  private url = `${host}GuiaRecepcionMateriaPrima`;
  private urlProveedor = `${host}Proveedor`;



  constructor(private http: HttpClient,
              private errorHandling: ErrorHandling) {
  }

  consultarProveedor (filtros: FiltrosProveedor): Observable<any> {
    const url = `${this.urlProveedor}/Consultar`;
    return this.http.post<any>(url, filtros).catch(this.errorHandling.handleError);
  }


  consultarMateriaPrima(filtros: FiltrosMateriaPrima): Observable<any> {
    const url = `${this.url}/Consultar`;
    return this.http.post<any>(url, filtros).catch(this.errorHandling.handleError);
  }

  anularMateriaPrima(id:number): Observable<any> {
    const url = `${this.url}/Anular`;
     
    const body: any = {
      GuiaRecepcionMateriaPrimaId: id,
      Usuario: "mruizb"
    };
    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }

  registrarPesado(request:ReqRegistrarPesado): Observable<any> {
    const url = `${this.url}/RegistrarPesado`;
    request.EmpresaId = 1;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }

  actualizarPesado(request:ReqActualizarPesado): Observable<any> {
    const url = `${this.url}/RegistrarPesado`;
    request.EmpresaId = 1;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }


}
