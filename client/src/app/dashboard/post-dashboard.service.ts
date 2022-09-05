
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
export class PostDashboardService {

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
    return this.http.post(`${this.apiUrl}/post_quiz_sets/getTotalQuiz`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getQuizDataReport(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/post_attempted_quiz_sets/getQuizDataReport`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }


  getDasboardQuizSets(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/post_quiz_sets/getDasboardQuizSets`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getQuizTopic(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/post_quiz_sets/getQuizTopic`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getTopicReport(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/post_attempted_quiz_sets/getTopicReport`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  
  getAttemptUserList(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/post_attempted_quiz_sets/getAttemptUserList`, paramsVal)
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
