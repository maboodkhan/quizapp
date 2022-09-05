
import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PostDashboardService } from '../../post-dashboard.service';

@Component({
  selector: 'app-post-school-dashboard',
  templateUrl: './post-school-dashboard.component.html',
  styleUrls: ['./post-school-dashboard.component.css']
})
export class PostSchoolDashboardComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  currentUser: any;
  type_order: String;
  schoolObj: any = null;
  schoolList: any;
  dataSource: any;
  displayedColumns = ['school_name'];
  limit = 6;
  offset = 0;
  schoolLength: number;
  rowHeight = '650px';
  heading = false;
  total_school: number;
  constructor(private postDashboardService: PostDashboardService,
    private dashboardService: DashboardService ) {  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.type_order = this.currentUser.user_Type.type_order;
    if(this.type_order == '1' || this.type_order == '2'){
      this.schoolObj = {
        type_name: this.currentUser.user_Type.type_name,
        offset: this.offset,
        limit: this.limit
      };
      this.dashboardService.getSchoolsList(this.schoolObj).subscribe((schoolList: any) => {
        // console.log(schoolList);
        this.total_school = schoolList.total_school;
        this.schoolList = schoolList.data;
        this.schoolLength = this.total_school;
        if(this.schoolLength > 2){
          this.rowHeight = "480px";
          this.schoolLength = 3;
          this.heading = true;
        }
      });
    }else{
      this.schoolObj = {
        user_id: this.currentUser.id,
        offset: this.offset,
        limit: this.limit
      }
      this.dashboardService.getUserSchool(this.schoolObj).subscribe((schoolList: any) => {
        this.total_school = schoolList.total_school;
        this.schoolList = schoolList.data;
        this.schoolLength = this.total_school;
        if(this.schoolLength > 2){
          this.rowHeight = "480px";
          this.schoolLength = 3;
          this.heading = true
        }
        // console.log(this.schoolLength)
      });
    }
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
