/**
 * Angular  decorators and services
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'dashboard',
  // encapsulation: ViewEncapsulation.None,
  styles: [''],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  userid: string;
  userDept: any;
  userType: string;
  defaultTab = 0;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
        this.userid = this.currentUser.id;
        this.userType = this.currentUser.userType;
    }

    this.route.queryParams.subscribe((paramsData: any) => {
      if(paramsData.tabType == '1'){
        this.defaultTab = 1;
      }
    })
  }
}
