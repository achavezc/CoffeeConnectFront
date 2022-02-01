import { Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
//import firebase from 'firebase/app'
import { Observable } from 'rxjs/Observable';
import { host } from '../shared/hosts/main.host';
import { HttpClient } from '@angular/common/http';
import { ErrorHandling } from '../shared/util/error-handling';
import { ILogin } from './models/login';

@Injectable()
export class AuthService {
  private user: Observable<any>;
  private userDetails: any = null;

  constructor(public _firebaseAuth: AngularFireAuth, public router: Router, private http: HttpClient,
    private errorHandling: ErrorHandling,  public activateRoute : ActivatedRoute
  ) {
    this.user = _firebaseAuth.authState;
    this.user.subscribe(
      (user) => {
        if (user) {
          this.userDetails = user;
        }
        else {
          this.userDetails = null;
        }
      }
    );

  }

  signupUser(email: string, password: string) {
    //your code for signing up the new user
  }
  signinUser(email: string, password: string) {
    //your code for checking credentials and getting tokens for for signing in user
    // return '1';
    // return this._firebaseAuth.signInWithEmailAndPassword(email, password)
    //uncomment above firebase auth code and remove this temp code
    const body: any = {
      UserName: email,
      Password: password
    };

    return this.http.post<ILogin>(`${host}Authenticate/login`, body).catch(this.errorHandling.handleError);
    // .toPromise();
    /*return new Promise(function(resolve, reject) {
        setTimeout(function() {
          const url = `${host}Authenticate/login`;
          const data = this.http.get(url);
          resolve(data);
        }, 1000);
      });*/
  }

  logout() {
    this._firebaseAuth.signOut();
    this.router.navigate(['YOUR_LOGOUT_URL']);
  }

  isAuthenticated() {
    return true;
  }

  esReadOnly2(listaOpciones){
    var result = true;
    var readonly = true;
    var pathActual = this.router.url.split('?')[0] ;
    const validOpcion =listaOpciones.filter(x => pathActual.includes(x.Path));
    if(validOpcion.length > 0){
      result = true;
      readonly = false;
    }else{
      result = false;
      readonly = true;
    }
    return readonly;  
  }

  obtenerUrl(urlInput){
    let url: string =urlInput;
    let urlParams: string[];
    this.activateRoute.params.forEach(param =>
       alert(param['whatever your param name is'])
    );

    this.activateRoute.paramMap.subscribe(params => {
      var productid = params.get('productid');
      console.log(productid);// OUTPUT 1534
      
    });

    if (url.includes("?")) {
        url = url.substr(0, url.indexOf('?'));
    } else {
        urlParams = this.router.url.toString().split(';')[0].split(',');

        if (urlParams.length > 1) {
            urlParams.shift(); // Remove first element which is page name

            // Get entire splitting on each param
            let fullUrlSegments: string[] =urlInput.split('/');
            // Remove number of params from full URL
            fullUrlSegments = fullUrlSegments.slice(0, fullUrlSegments.length - urlParams.length);

            url = fullUrlSegments.join('/');
        }
    }

    alert(url);
  }
  esReadOnly(listaOpciones, form? ){
    var readonly = true;
    var pathActual = this.router.url.split('?')[0] ;
    const validOpcion = listaOpciones.filter(x => pathActual.includes(x.Path));
    if(validOpcion.length > 0){
      readonly = false;
      form.enable();
    }else{
      readonly = true;
      form.disable();
    }
    return readonly;  
  }

}
