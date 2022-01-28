import { Router} from '@angular/router';
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
    private errorHandling: ErrorHandling, 
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

  esReadOnly(listaOpciones){
    var result = true;
    var readonly = true;
    var pathActual = this.router.url;
    const validOpcion = listaOpciones.filter(x => x.Path == pathActual);
    if(validOpcion.length > 0){
      result = true;
      readonly = false;
    }else{
      result = false;
      readonly = true;
    }
    return readonly;  
  }

  esReadOnly2(listaOpciones, form){
    var result = true;
    var readonly = true;
    var pathActual = this.router.url;
    const validOpcion = listaOpciones.filter(x => x.Path == pathActual);
    if(validOpcion.length > 0){
      result = true;
      readonly = false;
      form.enable();
    }else{
      result = false;
      readonly = true;
      form.disable();
    }
    return readonly;  
  }

  

}
