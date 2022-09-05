import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';


@Injectable({
  providedIn: 'root'
})
export class SyllabusService {
  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }
  
  getLessonsList(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/lessons/getLessonsList`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }
  
  getLessonstById(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/lessons/getLessonsById`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  } 

  createNewLesson(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/lessons/createNewLesson`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  
  updateLesson(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/lessons/updateLesson`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getBoards(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/boards/getboards`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
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

  getTopicList(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/topics/getTopicList`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  
  getTopicListNew(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/topics/getTopicListNew`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getTopicById(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/topics/getTopicById`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  createNewTopic(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/topics/createNewTopic`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  updateTopic(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/topics/updateTopic`, paramsVal)
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
