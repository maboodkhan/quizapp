import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {

  
  private apiUrl = environment.apiUrl;

  constructor(private http: Http) { }



  getSchoolsList(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/schools/getSchoolsList`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }
  
  createdSchool(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/schools/createdSchool`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getSchoolById(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/schools/getSchoolById`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  updateSchool(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/schools/updateSchool`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getCouponsList(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/coupons/getCouponsList`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getSuggestSchools(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/schools/getSuggestSchools`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getActiveSchools(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/schools/getschools`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  createCoupon(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/coupons/createCoupon`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  editCoupon(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/coupons/editCoupon`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getCouponsById(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/coupons/getCouponsById`, paramsVal)
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

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error.json());
    return Observable.throw(error.json().error || 'Server error');
  }
}
