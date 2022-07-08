import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';
import { data } from '../shared/data/smart-data-table';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { ILogin } from '../services/models/login';

@Injectable()
export class MaestroService {
  private url = `${host}Maestro`;
  vSessionUser: ILogin;

  constructor(private http: HttpClient, private errorHandling: ErrorHandling) { }

  obtenerMaestros(codigoTabla: string, lang?: string) {
    const url = `${this.url}/Consultar`;
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    const body: any = {
      CodigoTabla: codigoTabla,
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
      Idioma: lang
    };
    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }

  ConsultarDepartamento(request: any): Observable<any> {
    const url = `${this.url}/ConsultarDepartamento`;
    return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
  }
 //nuevos servicios para el nota ingreso//
 
 ConsultarCampanias(codigoTipo: any): Observable<any> {
  const body: any = {
    CodigoTipo: codigoTipo
  };
  const url = `${this.url}/ConsultarCampanias`;
  return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
}
 
ConsultarConceptos(codigoTipo: any): Observable<any> {
  const body: any = {
    CodigoTipo: codigoTipo
  };
  const url = `${this.url}/ConsultarConceptos`;
  return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
}

ConsultarCorrelativoPlanta(request: any): Observable<any> {
  const url = `${this.url}/ConsultarCorrelativo`;
  return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
}
RegistrarCorrelativo(request: any): Observable<any> {
  const url = `${this.url}/RegistrarCorrelativo`;
  return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
}
ActualizarCorrelativo(request: any): Observable<any> {
  const url = `${this.url}/ActualizarCorrelativo`;
  return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
}

ConsultarCorrelativoPorId(request: any): Observable<any> {
  const url = `${this.url}/ConsultarCorrelativoPorId`;
  return this.http.post<any>(url, request).catch(this.errorHandling.handleError);
}
 
ConsultarTipoCorrelativo(codigoTipo: any): Observable<any> {
  const body: any = {
    CodigoTipo: codigoTipo
  };
  const url = `${this.url}/ConsultarTipoCorrelativo`;
  return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
}


 //////


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