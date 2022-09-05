import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../_services';

@Component({
  selector: 'app-autologin',
  template: `
  <div align="center">
    <img src="/assets/img/pre-loader.gif" />
  </div>
  `,
  styles: []
})
export class AutologinComponent implements OnInit {

  @Output() isAuth = new EventEmitter<boolean>();
  user_id: number;
  token: string;
  username: string;
  returnUrl: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(
      (params: any) => {
        if(Object.keys(params).length > 0){
          Object.keys(params).forEach((pKey)=>{
            params = pKey;
          });          
          // console.log(params)
          params = atob(decodeURIComponent(params));
          // console.log(params)
          params = params.split('%26');
          this.username = (params ? params[0].split('%3D') : '');
          this.username = (this.username ? this.username[1].replace('%40','@') : '');
          this.user_id = (params ? params[1].split('%3D') : '');
          this.user_id = +(this.user_id ? this.user_id[1] : '');
          this.token = (params ? params[2].split('%3D') : '');
          this.token = (this.token ? this.token[1] : '');

          this.authService.autologin(this.username, this.user_id, this.token).subscribe(
            data => {              
              if(data.status == false || this.username==''){
                this.router.navigate(['/login']);              
              } else {
                this.returnUrl ='/dashboard';
                this.router.navigate([this.returnUrl]);
                this.isAuth.emit(true);
              }
            }
          );
        } else {
          this.router.navigate(['/login']);
        }
      }
    );
  }

}
