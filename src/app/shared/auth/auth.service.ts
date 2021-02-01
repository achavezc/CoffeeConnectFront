import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
//import firebase from 'firebase/app'
import {Observable} from 'rxjs/Observable';
import {host} from '../../shared/hosts/main.host';
import {HttpClient, HttpHeaders} from '@angular/common/http';
//import {ErrorHandling} from '../../shared/util/error-handling';
import {Login} from '../services/models/login'

@Injectable()
export class AuthService {
  private user: Observable<any>;
  private userDetails: any = null;

  constructor(public _firebaseAuth: AngularFireAuth, public router: Router, private http: HttpClient,
    //private errorHandling: ErrorHandling
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
  private data: Login;
  signinUser(email: string, password: string){
    //your code for checking credentials and getting tokens for for signing in user
   // return '1';
    // return this._firebaseAuth.signInWithEmailAndPassword(email, password)
    //uncomment above firebase auth code and remove this temp code
    const body: any = {
      UserName: email,
      Password: password
      };    
      let headers = new HttpHeaders()
      .set( 'Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*' )
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE' );
    return this.http
    .post<Login>(
        `${host}Authenticate/login`, body, { headers: headers }
      )
      .toPromise();
  /*return new Promise(function(resolve, reject) {
      setTimeout(function() {
        const url = `${host}Authenticate/login`;
        const data = this.http.get(url);
        resolve(data);
      }, 1000);
    });*/
    
    
  }
  public login(): Observable<Login>
  {
    const url = `${host}Authenticate/login`;
    return this.http.get<Login>(url);
     
  }

  logout() {
    this._firebaseAuth.signOut();
    this.router.navigate(['YOUR_LOGOUT_URL']);
  }

  isAuthenticated() {
    return true;
  }
}
