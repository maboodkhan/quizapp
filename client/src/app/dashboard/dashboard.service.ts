import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { environment } from 'src/environments/environment';

@Injectable()
export class DashboardService {

  private apiUrl = environment .apiUrl;
  currentUser:any;
  token:string;
  constructor(private http: Http) { 
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser) {
        this.token = this.currentUser.token;        
    }
  }


  getTotalQuiz(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_sets/getTotalQuiz`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getQuizDataReport(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/attempted_quiz_sets/getQuizDataReport`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getUserSchool(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_classes/getUserSchool`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getSchoolsList(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/schools/getSchoolsList`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }


  getUserClass(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_classes/getUserClass`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getClassList(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/classes/getClassList`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }


  getUserSection(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_classes/getUserSection`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getSectionList(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/class_sections/getSectionList`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getDasboardQuizSets(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_sets/getDasboardQuizSets`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getStudentList(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/user_data/getStudentList`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getSchoolById(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/schools/getSchoolById`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getClass(paramsVal: any): Observable<any[]>{
    return this.http.get(`${this.apiUrl}/classes/getClass/` + paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }
  

  getSection(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/class_sections/getSection`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  
  getStudentData(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_users/getStudentData`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getQuizTopic(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/quiz_sets/getQuizTopic`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getTopicReport(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/attempted_quiz_sets/getTopicReport`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  
  getAttemptUserList(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/attempted_quiz_sets/getAttemptUserList`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error.json());
    return Observable.throw(error.json().error || 'Server error');
  }

  
}
