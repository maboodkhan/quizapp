
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../user.service';
// import { UserService } from '../user.service';

@Component({
  selector: 'app-stu-attendence-detail',
  templateUrl: './stu-attendence-detail.component.html',
  styleUrls: ['./stu-attendence-detail.component.css']
})
export class StuAttendenceDetailComponent implements OnInit {

  currentUser: any;
  userId: number;
  studentUserId: number;
  attendanceDate: any;
  userData: any;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = this.currentUser.id;

    this.route.params.subscribe(params => {
      this.studentUserId = +params['id'];
    });
    this.route.queryParams.subscribe(queryParams => {
      this.attendanceDate = queryParams.attendanceDate;
    });
    this.getattendance();
  }

  
  getattendance(){
    let obj = {
      studentUserId: this.studentUserId,
      attendanceDate: this.attendanceDate
    }
    this.userService.getUserAttendance(obj).subscribe((result: any) => {
      this.userData = result.data;
    })
  }

}

