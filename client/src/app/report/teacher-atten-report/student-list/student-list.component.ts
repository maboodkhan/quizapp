import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatPaginator, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})

export class StudentListComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  attendance:any;
  currentUser: any;
  dataSource: any;
  displayedColumns: string[] = ['Sno', 'name', 'email','duration'];
  userData = [];

  constructor(private dialogRef: MatDialogRef<StudentListComponent>,
    private reportService: ReportService,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.attendance = data;
    }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let obj = {
      schedule_id: this.attendance.id,
      limit: 200,
      offset: 0
    }
    console.log(obj);
    this.reportService.getAttendanceList(obj).subscribe((studentList: any) => {
      studentList.data.forEach(element => {
        if (element.startTime != null && element.endTime != null) {
          var startTime = new Date(element.startTime).getTime();
          var endTime = new Date(element.endTime).getTime();
          var duration = endTime - startTime
          duration = 1000 * Math.round(duration / 1000);
          var d = new Date(duration);
          element.duration = d.getUTCHours() + ':' + d.getUTCMinutes() + ':' + d.getUTCSeconds();
          this.userData.push(element);
        } else {
          element.duration = "";
          this.userData.push(element);
        }
      });
      this.dataSource = new MatTableDataSource(this.userData);
    })
  }


}
