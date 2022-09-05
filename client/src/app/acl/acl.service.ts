import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class AclService {

  private apiUrl = environment .apiUrl;

  constructor(private http: Http) { }

  addNewPermission(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permissions/addNewPermission`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  }

  getPermissions(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permissions/getPermissions`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  } 

  
  getPermissionsById(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permissions/getPermissionsById`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  } 

  updatePermission(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permissions/updatePermission`, paramsVal)
      .map((response: Response) => {
        return response.json();
      });
  } 

  permissionAssign(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permission_roles/permissionAssign`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  permissionRemove(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permission_roles/permissionRemove`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getPrevParentId(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permissions/getPrevParentId`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  userPermissionAssign(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permission_users/permissionAssign`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  userPermissionRemove(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permission_users/permissionRemove`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getPermission(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permissions/getPermission`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  userTypeById(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/usertypes/UserTypeById`, paramsVal)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  updateMenuOrder(paramsVal: any): Observable<any[]> {
    return this.http.post(`${this.apiUrl}/permissions/updateMenuOrder`, paramsVal)
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