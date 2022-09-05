import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }

  getAppDeepLink(paramsVal: any): Observable<any[]>{
    return this.http.post(`${this.apiUrl}/app_deep_links/getAppDeepLink`, paramsVal)
      .map((response: Response) => {
        return response.json();
    })
    .catch(this.handleError);
  }

  sendUserNotification(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/quiz_users/sendNotification`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }

  sendNotification(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/user_data/sendWebNotification`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }

  getnotifications(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/push_notifications/getnotifications`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }


  notificationType(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/push_notification_masters/notificationType`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }

  subNotification(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/push_notification_masters/subNotification`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }

  getNotificationById(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/push_notifications/getNotificationById`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }

  deleteNotification(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/push_notifications/deleteNotification`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }


  addNotification(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/push_notifications/addNotification`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }

  getCountries(paramsVal): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/countries/getCountries`, paramsVal)
            .pipe(map((response : Response) => {
                return response.json();
            })
          ).
          catch(this.handleError);
  }


  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error.json());
    return Observable.throw(error.json().error || 'Server error');
  }
}
