import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../user.service';
// import { UserService } from '../user.service';

@Component({
  selector: 'app-attendance-detail',
  templateUrl: './attendance-detail.component.html',
  styleUrls: ['./attendance-detail.component.css']
})
export class AttendanceDetailComponent implements OnInit {

  currentUser: any;
  userId: number;
  attendanceId: number;
  attendanceDate: any;
  userData: any;
  schedule_id: number;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = this.currentUser.id;

    this.route.params.subscribe(params => {
      this.attendanceId = +params['id'];
      this.schedule_id = +params['schedule_id'];
    });
    this.route.queryParams.subscribe(queryParams => {
      this.attendanceDate = queryParams.attendanceDate;
    });
    this.getattendance();
  }

  
  getattendance(){
    let obj = {
      attendanceId: this.attendanceId,
      attendanceDate: this.attendanceDate
    }
    this.userService.getUserAttendance(obj).subscribe((result: any) => {
      this.userData = result.data;
    })
  }

}
