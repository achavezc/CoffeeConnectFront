import { Injectable } from '@angular/core';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorHandling } from '../shared/util/error-handling';

@Injectable({
  providedIn: 'root'
})
export class KardexService {

  private url = `${host}kardex`;

  constructor(private http: HttpClient,
    private errorHandling: ErrorHandling) { }

  Descargar() {
    const url = `${this.url}/GenerarKardex`;
    return this.http.get(url, null);
  }
}
