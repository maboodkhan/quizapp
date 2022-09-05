import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import 'chart.piecelabel.js';

@Component({
  selector: 'app-dash-quiz-set',
  templateUrl: './dash-quiz-set.component.html',
  styleUrls: ['./dash-quiz-set.component.css']
})
export class DashQuizSetComponent implements OnInit {

  currentUser: any;
  customFilters: any = null;
  isTeacher: boolean = false;

  constructor(private dashboardService: DashboardService) {  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(this.currentUser);
    if(this.currentUser.user_Type.type_order == '5'){
      this.isTeacher = true;
    }
  }

}
