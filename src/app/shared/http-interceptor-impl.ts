import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { StorageService } from './storage-service';
import 'rxjs/add/operator/catch';
//import {DeviceDetectorService} from 'ngx-device-detector';
import swal from 'sweetalert2';
import { Router } from '@angular/router';


@Injectable()
export class HttpInterceptorImpl implements HttpInterceptor {


  constructor(private http: HttpClient,
    //private storage: StorageService,
    //private router: Router,
    //public deviceService: DeviceDetectorService
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var contenType = 'application/json'
    if(req.url.includes("/SocioFincaCertificacion/Registrar") || req.url.includes("/SocioFincaCertificacion/DescargarArchivo")){
      contenType = 'multipart/form-data'
    }
      const token = "";// this.storage.getToken();
      const headers = new HttpHeaders()
        .set('enctype', contenType)
        .set('Allowed', 'true')
        .set('Accept', 'application/json');
      //.append('Authorization', `bearer ${token}`);
      const reqCloned = req.clone({
        headers: headers
      });
   
   

    return next.handle(reqCloned).catch((err) => {
      console.error('Error Ocurred', err);
      return Observable.throw(err);
      /*
      if (err.status === 440) {
        swal({
          title: '',
          customContainerClass: 'swal-dialog-container',
          animation: false,
          html: 'Sesión expirada',
          confirmButtonText: 'Aceptar',
          confirmButtonClass: 'styled-2'
        });
      }
      if (err.status === 401 || err.status === 440) {
        this.storage.clear();
        this.router.navigate(['/login']);
      } else {
        swal({
          title: '',
          customContainerClass: 'swal-dialog-container',
          animation: false,
          html: 'Disculpe las molestias estamos presentando inconvenientes con nuestros sistemas',
          confirmButtonText: 'Aceptar',
          confirmButtonClass: 'styled-2'
        });
        this.router.navigate(['/tarjeta-oh']);
      }
      console.error('Error Ocurred', err);
      return Observable.throw(err);
      */
    }) as any;
  }
}
