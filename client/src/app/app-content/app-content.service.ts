import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class AppContentService {

  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }

  getBoards(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/boards/getboards`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getActiveSchools(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/schools/getschools`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getClasses(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/classes/getclasses`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getSubjects(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/subjects/getsubjects`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getLessons(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/lessons/getlessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getContent(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/app_contents/getContent`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  create(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/app_contents/create`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  update(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/app_contents/update`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getContentById(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/app_contents/getContentById`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  } 

  getLessonContent(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/app_contents/getLessonContent`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error.json());
    return Observable.throw(error.json().error || 'Server error');
  }
}