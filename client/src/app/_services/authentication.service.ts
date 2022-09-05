import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { map } from 'rxjs/operators';
import { User } from '../_models'
import { BackendService } from './backend.service'
import { environment } from '../../environments/environment';



@Injectable()
export class AuthenticationService {
  private apiUrl = environment.apiUrl;
  constructor(private http: Http, private backend: BackendService) { }

  login(username, password): Observable<any>{
    
    return this.http.post(`${this.apiUrl}/users/userlogin`, { username, password })
            .pipe(map((response) => {
                // login successful if there's a jwt token in the response
                let user = response.json();
                if (user && user.id) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    user.isAuthenticated = true;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    return response.toString();
                }
                return user;
            }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
  }

  isAuthenticated() {
    let user = <User>JSON.parse(localStorage.getItem('currentUser'));
    return user && user.isAuthenticated ? true : false;
  }

  autologin(username, user_id, token): Observable<any>{
    
    return this.http.post(`${this.apiUrl}/users/applogin`, { username, user_id, token })
            .pipe(map((response) => {
              localStorage.removeItem('currentUser');
              // login successful if there's a jwt token in the response
              let user = response.json();
              if (user && user.id) {
                  // store user details and jwt token in local storage to keep user logged in between page refreshes
                  user.isAuthenticated = true;
                  localStorage.setItem('currentUser', JSON.stringify(user));
                  return response.toString();
              }
              return user;
            }));
  }
}
