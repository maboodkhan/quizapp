import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';


@Injectable({
  providedIn: 'root'
})


export class ContentService {
  
  private API_URL = environment.API_URL;
  private API_TOKEN = environment.API_TOKEN;
  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }

  getVideos(query: string, pageToken: string): Observable <any> {
    let url;
    if(pageToken){
      url = `${this.API_URL}?q=${query}&key=${this.API_TOKEN}&part=snippet&type=video&maxResults=10&pageToken=${pageToken}`;
    }else{
      url = `${this.API_URL}?q=${query}&key=${this.API_TOKEN}&part=snippet&type=video&maxResults=10`;
    }
    return this.http.get(url)
        .map((response: Response) => {
        return response.json();
        })
  }

  getCountries(): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/countries/getCountries`,"")
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

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

  getTopics(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/topics/gettopics`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getContent(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/contents/getContent`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  create(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/contents/create`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  update(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/contents/update`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getContentById(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/contents/getContentById`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  } 

  getLessonContent(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/contents/getLessonContent`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getCountrySchool(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/schools/getCountrySchool`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getTopic(topicId): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/topics/getTopic/${topicId}`)
      .map((response: Response) => {
        return response.json();
      });
  }

  getClass(classId): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/classes/getClass/${classId}`)
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