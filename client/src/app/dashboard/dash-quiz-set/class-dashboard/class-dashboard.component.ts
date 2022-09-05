import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { DashboardService } from '../../dashboard.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-class-dashboard',
  templateUrl: './class-dashboard.component.html',
  styleUrls: ['./class-dashboard.component.css']
})
export class ClassDashboardComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  currentUser: any;
  type_order: String;
  classObj: any = null;
  classList: any;
  school_id: number;
  limit = 6;
  offset = 0;
  classLength: number;
  total_class: number;
  heading = false;
  school_name: string;
  rowHeight = '650px';

  constructor(private dashboardService: DashboardService,
    private route: ActivatedRoute) {  }

  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.route.params.subscribe(
      params => {
        this.school_id = +params['school_id'];
      }
    );
    // console.log(this.school_id);
    if(isNaN(this.school_id)){
      this.school_id = this.currentUser.user_class[0].school_id;
    }
    this.getSchool();    
    this.type_order = this.currentUser.user_Type.type_order;
    if(this.type_order == '1' || this.type_order == '2'){
      this.classObj = {
        school_id: this.school_id,
        offset: this.offset,
        limit: this.limit
      }
      this.dashboardService.getClassList(this.classObj).subscribe((classList: any) => {
        // console.log(classList);
        this.total_class = classList.total_class;
        this.classList = classList.data;
        this.classLength = this.total_class;
        if(this.classLength > 2){
          this.rowHeight = '480px';
          this.classLength = 3;
          this.heading = true;
        }
      });
    }else{
      this.classObj = {
        user_id: this.currentUser.id,
        school_id: this.school_id,
        offset: this.offset,
        limit: this.limit
      }
      this.dashboardService.getUserClass(this.classObj).subscribe((classList: any) => {
        // console.log( classList);
        this.total_class = classList.total_class;
        this.classList = classList.data;
        this.classLength = this.total_class;
        if(this.classLength > 2) {
          this.rowHeight = '480px';
          this.classLength = 3;
          this.heading = true;
        }
      });
    }
  }

  getSchool(){
    this.classObj = {
      school_id: this.school_id
    }
    this.dashboardService.getSchoolById(this.classObj).subscribe((schoolData: any) => {
      // console.log(schoolData);
      this.school_name = schoolData.data.school_name;
    })
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
