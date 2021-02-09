import { Injectable } from '@angular/core';
import {host} from '../shared/hosts/main.host';
import {HttpClient} from '@angular/common/http';
import {ErrorHandling} from '../shared/util/error-handling';



@Injectable()
export class MaestroService {
  private url = `${host}Maestro`;



  constructor( private http: HttpClient,private errorHandling: ErrorHandling)
  {
    
  }
  


  obtenerMaestros(codigoTabla: string, empresaId: number) {
    const url = `${this.url}/Consultar`;

    const body: any = {
      CodigoTabla: codigoTabla,
      EmpresaId: empresaId
    };

    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }


}