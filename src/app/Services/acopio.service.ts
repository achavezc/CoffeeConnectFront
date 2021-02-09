import {Injectable} from '@angular/core';
import {host} from '../shared/hosts/main.host';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {ErrorHandling} from '../shared/util/error-handling';

@Injectable()
export class AcopioService {
  private url = `${host}GuiaRecepcionMateriaPrima`;



  constructor(private http: HttpClient,
              private errorHandling: ErrorHandling) {
  }



  consultarMateriaPrima(): Observable<any> {
    const url = `${this.url}/Consultar`;

    const body: any = {
      Numero: "",
      NombreRazonSocial: "",
      TipoDocumentoId: "",
      NumeroDocumento: "47846136",
      ProductoId: "01",
      CodigoSocio: "",
      EstadoId: "",
      FechaInicio: "2020-01-27T18:25:43.511Z",
      FechaFin: "2021-01-31T18:25:43.511Z",
    };

    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }


}