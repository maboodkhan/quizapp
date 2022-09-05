import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dash-quizset-post-test',
  templateUrl: './dash-quizset-post-test.component.html',
  styleUrls: ['./dash-quizset-post-test.component.css']
})
export class DashQuizsetPostTestComponent implements OnInit {

  currentUser: any;
  customFilters: any = null;
  isTeacher: boolean = false;

  constructor() {  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(this.currentUser);
    if(this.currentUser.user_Type.type_order == '5'){
      this.isTeacher = true;
    }
  }

}
