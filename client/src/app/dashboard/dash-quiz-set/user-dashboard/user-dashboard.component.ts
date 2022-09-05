import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  @Input() inputData;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  school_id: any;
  class_id: any;
  section_id: any;
  limit = 12;
  offset = 0;
  total_count: number;
  customFilters = {}
  studentList: any;
  heading = false;
  total_students: number;
  studentLength: number;
  section_name: string;
  rowHeight: string = "650px";

  constructor(private dashboardService: DashboardService,
    private route: ActivatedRoute) { }

  ngOnInit() {

    this.route.params.subscribe(
      params => {
        this.school_id = +params['school_id'];
        this.class_id = +params['class_id'];
        this.section_id = +params['section_id'];
      }
    );
    this.customFilters = {
      school_id: this.school_id,
      class_id: this.class_id,
      section_id: this.section_id,
      limit: this.limit,
      offset: this.offset
    }
    this.section_name = this.inputData.section_name;

    this.dashboardService.getStudentList(this.customFilters).subscribe((studentData: any) => {
      // console.log(studentData);
      this.total_students = studentData.total_students;
      this.studentList = studentData.data;
      this.studentLength = this.total_students;
        if(this.studentLength > 2){
          this.studentLength = 3;
          this.rowHeight = "450px"
          this.heading = true;
        }
    });

  }

  ngAfterViewInit() {

    merge( this.paginator.page)
    .pipe(
    tap(() => {
        this.offset = this.paginator.pageIndex * this.paginator.pageSize;
        this.limit = this.paginator.pageSize;
        this.ngOnInit();
        })
    )
    .subscribe();
}

}
