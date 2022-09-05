import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserTypeService {

  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }



  getUserTypes(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/usertypes/getUserTypes`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  createUserType(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/usertypes/createUserType`, paramsVal)
    .map((response:Response) => {
      return response.json();
    })
    .catch(this.handleError);
  }

  UserTypeById(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/usertypes/UserTypeById`, paramsVal)
    .map((response:Response) => {
      return response.json();
    })
    .catch(this.handleError);
  }


  updateUserType(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/usertypes/updateUserType`, paramsVal)
    .map((response:Response) => {
      return response.json();
    })
    .catch(this.handleError);
  }
  
  getNextTypes(id:string):Observable<void>{
    let deptsUrl = `${this.apiUrl}/usertypes/getNextTypes?user_id=${id}`;
    return this.http.get(deptsUrl).map((response: Response) => {
      return response.json();
    }).catch(this.handleError);
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error.json());
    return Observable.throw(error.json().error || 'Server error');
  }
}
