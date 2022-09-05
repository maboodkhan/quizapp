import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';

@Injectable({
  providedIn: 'root'
})


export class OnlineScheduleService {

  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }

  getSchedule(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/online_schedules/getAllSchedules`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getLessons(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/lessons/getlessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  deleteSchedule(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/online_schedules/deleteSchedule`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  addSchedule(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/online_schedules/addSchedule`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  editSchedule(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/online_schedules/editSchedule`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getScheduleById(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/online_schedules/getScheduleById`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getScheduleTeacher(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/online_schedules/getScheduleTeacher`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  checkZoomMeeting(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/zoom_class_meetings/checkZoomMeeting`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getUnderUser(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/online_schedules/getUnderUser`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  getCountryLessons(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/country_lessons/getlessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getCountryMapLessons(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/country_lesson_mappings/getlessons`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getScheduleLesson(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/online_schedule_details/getScheduleLesson`, paramsVal)
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