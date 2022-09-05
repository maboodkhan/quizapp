/**
 * Angular  decorators and services
 */
import {
  Component,
  OnInit,
  OnChanges,
  Input,
  // ViewEncapsulation,
  DoCheck,
  AfterViewChecked,
  ViewChild
} from '@angular/core';
import { AppState } from '../app.service';
import { User } from '../_models'
import { Router, ActivatedRoute } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { AuthenticationService } from '../_services';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { environment } from 'src/environments/environment';
  import { from } from 'rxjs';

/**
 * App Component
 * Entry Component
 */
@Component({
  selector: 'root',
  templateUrl: './root.component.html',
  styleUrls: [
    './root.component.css'
  ],
  animations:[trigger('EnterLeave', [
    state('flyInOut', style({ transform: 'translateX(0)' })),
    transition(':enter', [
      style({ transform: 'translateX(-100%)' }),
      animate('0.5s 200ms ease-in')
    ]),
    transition(':leave', [
      animate('0.3s ease-out', style({ transform: 'translateX(100%)' }))
    ])
  ])],
})
export class RootComponent implements OnInit, AfterViewChecked {

  @ViewChild('sidenav') sidenav: MatSidenav;
  public name = 'Marksharks - LMS';

  currentUser: User;
  isMobile = false;
  username: string;
  userType: string;
  department: string;
  showReport: boolean;
  showUser: boolean;
  crmURL = environment.crmUrl;
  userClasses: any;
  showMenuItem = false;
  showNotifyBox: boolean;
  showContent: boolean;
  showSyllabus: boolean;

  constructor(
    public appState: AppState,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthenticationService,
    breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      if (result.matches) {
        // this.activateHandsetLayout();
        this.isMobile = true;
      }
    });
  }

  ngAfterViewChecked(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || <User>{};
    //let uClassVal = [];
    this.username = this.currentUser.username;
    this.userType = this.currentUser.userType;
    this.department = this.currentUser.department;
    this.userClasses = this.currentUser.user_class;
    if(this.userClasses) {
      
      this.userClasses.forEach((cVal) => {
        if(cVal.school_id == 7 && this.userType != 'Teacher Jr.') {
          this.showMenuItem = true;
        }
      });
    } 
  }

  public ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || <User>{};
    this.userClasses = this.currentUser.user_class;
    this.username = this.currentUser.username;
    this.userType = this.currentUser.userType;
    this.department = this.currentUser.department;
    this.isMobile = true;

    if(this.userClasses) {
      
      this.userClasses.forEach((cVal) => {
        if(cVal.school_id == 7  && this.userType != 'Teacher Jr.') {
          this.showMenuItem = true;
        }
      });
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.close();
    this.router.navigate(['login']);
  }

  isAuth(isAuth: boolean) {
    if (isAuth) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
  }

  onRightClick() {
    alert('Right click is not allowed!');
    return false;
  }

  openUrl() {
    window.open(this.crmURL);
  }

  close() {
    this.sidenav.close();
  }

  showReports(){
    this.showReport = !this.showReport;
  }

  showUsers(){
    this.showUser = !this.showUser
  }

  showNotificationBox(){
    this.showNotifyBox = !this.showNotifyBox;
  }

  showContentBox(){
    this.showContent = !this.showContent;
  }

  showSyllabusBox(){
    this.showSyllabus = !this.showSyllabus;
  }

  boxClose(boxVal){
    this.router.navigate([boxVal]);
    this.close();
  }
}

