import {
  Component,
  EventEmitter,
  ViewEncapsulation,
  OnInit,
  DoCheck,
  Output
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {MaterialModule} from '../shared';
import { AuthenticationService } from '../_services';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'login',
  moduleId: module.id.toString(),
  templateUrl: './login.component.html',
  styles: [
    `
    Html, body{
      height:100%;
        margin:0px;
        padding:0px;
    }

    .container {
      height:100%;
        margin: 0 auto;
        padding:0px;
        position: relative;
        top: 200px;
    }
    .grandParentContaniner{
            display:table;
            height:100%;
            margin: 0 auto;
    }
    .parentContainer{
        display:table-cell;
        vertical-align:middle;
    }
    .parentContainer .loginForm{
        padding:10px;
        background: #fff;
        border: 1px solid #ddd;
        width:400px;  /*  your login form width */    display:table-cell;
        display:table-cell;
        vertical-align:middle;

    }
    .footer {
      max-height: 18px;
      right: 0;
      bottom: 0;
      left: 0;
      padding: 1rem;
      background-color: #efefef;
      text-align: center;
    }
    `
  ]
})
export class LoginComponent implements OnInit {
  @Output() isAuth = new EventEmitter<boolean>();
  model: any = {};
  loading = false;
  returnUrl: string;
  errorMessage: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
    this.authenticationService.logout();

    this.model.username = '';
    this.model.password = '';

    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  login() {
    this.loading = true;

    this.authenticationService.login(this.model.username,this.model.password).subscribe(
      data => {
        if(data.status == false){
          this.router.navigate(['/login']);
          this.errorMessage = data;
        } else {
          this.router.navigate([this.returnUrl]);
          this.isAuth.emit(true);
        }
        this.loading = false;
      },
      error => {
      //  console.log(error);
        this.loading = false;
      }
    );
  }
}
