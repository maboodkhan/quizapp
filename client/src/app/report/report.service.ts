import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class ReportService {


  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }

  getlogs(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/push_notification_logs/getlogs`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  teacherAttendanceReport(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/online_schedules/teacherAttendanceReport`, paramsVal)
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

  getQuizStudent(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/school_user_classes/getQuizStudent`, paramsVal)
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
