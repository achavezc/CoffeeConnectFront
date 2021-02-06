import {Injectable} from '@angular/core';
import {host} from '../shared/hosts/main.host';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {ErrorHandling} from '../shared/util/error-handling';

@Injectable()
export class ProyectoService {
  private url = `${host}GuiaRecepcionMateriaPrima`;



  constructor(private http: HttpClient,
              private errorHandling: ErrorHandling) {
  }



  obtenerMaestros(codigoTabla: string, empresaId: string): Observable<any> {
    const url = `${this.url}/Consultar`;

    const body: any = {
      Consultar: codigoTabla,
      EmpresaId: empresaId
    };

    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }


}