import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Response } from '@angular/http';
import { Observable, fromEvent } from 'rxjs';
import { IUser } from './user';
import { map } from 'rxjs/operators';

@Injectable()
export class UserService {

  private apiUrl = environment.apiUrl;
  private crmUrlApi = environment.crmUrlApi;
  currentUser:any;
  token:string;

  constructor(private http: Http) { 
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser) {
        this.token = this.currentUser.token;
    }
  }

  getUsers(id, paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/users/getAllUsers?access_token=${this.token}&user_id=${id}`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getUser(id: string): Observable<IUser> {
    if (id === '') {
      return Observable.of(this.initializeUser());
    }
    let getUserDetails = `${this.apiUrl}/users/getUser/${id}?access_token=${this.token}`;
    return this.http.get(getUserDetails).map((response: Response) => {
        return response.json();
      }).catch(this.handleError);
  }

  saveUser(user: IUser): Observable<IUser> {
    if (user.id == null) {
      return this.createUser(user);
    }
    return this.updateUser(user);
  }

  createUser(user: IUser): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/createUser?access_token=${this.token}`, user)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }

  private updateUser(user: IUser): Observable<IUser> {   
    return this.http.post(`${this.apiUrl}/users/updateUser/${user.id}?access_token=${this.token}`,user)
            .map((response : Response) => {
                return response.json();
            }).
            catch(this.handleError);
  }

  getUserTypes(id:string):Observable<void>{
    let deptsUrl = `${this.apiUrl}/usertypes/getNextTypes?access_token=${this.token}&user_id=${id}`;
    return this.http.get(deptsUrl).map((response: Response) => {
      return response.json();
    }).catch(this.handleError);
  }


  // getActiveSchools(id: string): Observable<IUser> {
  //   if (id === '') {
  //     return Observable.of(this.initializeUser());
  //   }
  //   let getUserDetails = `${this.apiUrl}/schools/getschools/${id}?access_token=${this.token}`;
  //   return this.http.get(getUserDetails).map((response: Response) => {
  //       return response.json();
  //     }).catch(this.handleError);
  // }

  
  getActiveSchools(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/schools/getschools`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  userSchools(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_classes/userSchools`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getClasses(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/classes/getclasses`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getClassSections(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/class_sections/getClassSections`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getSubjects(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/subjects/getsubjects`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getTypeUsers(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/users/getTypeUsers`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getUsersData(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_data/getUsersData`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  showUsersData(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/school_user_data/showUsersData`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  userClassSection(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/school_user_classes/userClassSection`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }


  addUsersData(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_data/addUsersData`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }
  

  getEditUsersData(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_data/getEditUsersData`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  deleteUsersData(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_data/deleteUsersData`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  showEditUsersData(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/school_user_data/showEditUsersData`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }
  

  editUsersData(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_data/editUsersData`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getSuggestData(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_users/getSuggestData`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  
  getOnlineClassStatus(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.crmUrlApi}/leads/getOnlineClassStatus`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getAttendanceList(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/attendances/getAttendanceList`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getUserAttendance(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/attendances/getUserAttendance`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getStudentAttendance(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/attendances/getStudentAttendance`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  sendNotification(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/user_data/sendWebNotification`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }

  sendUserNotification(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/quiz_users/sendNotification`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }

  getAppDeepLink(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/app_deep_links/getAppDeepLink`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getuserdetails(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_users/getuserdetails`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getCountries(): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/countries/getCountries`,"")
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getAppUser(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_users/getAppUser`,paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  deleteUser(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_users/deleteUser`,paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  appUserDetail(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_users/appUserDetail`,paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  userStatus(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_data/userStatus`,paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }


  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    //console.error(error.json());
    return Observable.throw(error.json().error || 'Server error');
  }

  initializeUser(): IUser {
    // Return an initialized object
    return {
      id: null,
      firstName: null,
      lastName: null,
      username: null,
      password: null,
      contactNumber: null,
      altNumber: null,
      email: null,
      user_type_id: null,
      status: null,
      user_class: null,
      user_countries: null,
      assigned_to: null
    };
  }
}
