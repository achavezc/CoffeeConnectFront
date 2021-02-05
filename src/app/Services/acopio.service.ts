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



  getProyectosPorCategoria(categoriaId: string, tipoProyecto: string): Observable<any> {
    const url = `${this.url}/GetProyectosPorCategoria`;

    const body: any = {
      CategoriaId: categoriaId,
      TipoProyecto: tipoProyecto
    };

    return this.http.post<any>(url, body).catch(this.errorHandling.handleError);
  }

  
  getProyectoPorId(id: string): Observable<any> {
    const url = `${this.url}/GetProyectoPorId/`+ id;
    return this.http.get(url).catch(this.errorHandling.handleError);
  }

  public getProyectosPorMiembro(miembroId: number): Observable<any> 
  {  
  
      const url = `${host}ProyectoMiembro/GetListaProyectosPorMiembroId/`+ miembroId;
      return this.http.get(url).catch(this.errorHandling.handleError);

  }

  public getProyectosValorPorMiembro(miembroId: number): Observable<any> 
  {  
  
      const url = `${host}ProyectoMiembro/GetListaProyectosValorPorMiembroId/`+ miembroId;
      return this.http.get(url).catch(this.errorHandling.handleError);

  }

  public getProyectosValorPorEspeciePorMiembro(miembroId: number): Observable<any> 
  {  
  
      const url = `${host}ProyectoMiembro/GetListaProyectosValorPorEspeciePorMiembroId/`+ miembroId;
      return this.http.get(url).catch(this.errorHandling.handleError);

  }

}