import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-section-dashboard',
  templateUrl: './section-dashboard.component.html',
  styleUrls: ['./section-dashboard.component.css']
})
export class SectionDashboardComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  currentUser: any;
  type_order: String;
  sectionObj: any = null;
  sectionList: any;
  school_id: number;
  class_id: number;
  limit = 12;
  offset = 0;
  heading = false;
  sectionLength: number;
  total_section: number;
  school_name: string;
  class_name: string;
  rowHeight = '650px';
  constructor(private dashboardService: DashboardService,
    private route: ActivatedRoute) {  }

  ngOnInit() {

    this.route.params.subscribe(
      params => {
        this.school_id = +params['school_id'];
        this.class_id = +params['class_id'];
      }
    );
    
    this.breadcrumbs();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.type_order = this.currentUser.user_Type.type_order;
    if(this.type_order == '1' || this.type_order == '2'){
      
      this.sectionObj = {
        class_id: this.class_id,
        offset: this.offset,
        limit: this.limit
      }
      this.dashboardService.getSectionList(this.sectionObj).subscribe((sectionList: any) => {
        // console.log(sectionList);
        this.total_section = sectionList.total_section;
        // console.log(this.total_section);
        this.sectionList = sectionList.data;
        this.sectionLength = this.total_section;
        if(this.sectionLength > 2){
          this.rowHeight = '480px';
          this.sectionLength = 3;
          this.heading = true;
        }
      });
    }else{
      this.sectionObj = {
        user_id: this.currentUser.id,
        school_id: this.school_id,
        class_id: this.class_id,
        offset: this.offset,
        limit: this.limit
      }
      this.dashboardService.getUserSection(this.sectionObj).subscribe((sectionList: any) => {
        this.total_section = sectionList.total_section;
        this.sectionList = sectionList.data;
        this.sectionLength = this.total_section;
        if(this.sectionLength > 2){
          this.rowHeight = '480px';
          this.sectionLength = 3;
          this.heading = true;
        }
      });
    }
  }

  breadcrumbs(){
    this.sectionObj = {
      school_id: this.school_id,
      class_id: this.class_id
    }

    // get School Name
    this.dashboardService.getSchoolById(this.sectionObj).subscribe((schoolData: any) => {
      // console.log(schoolData);
      this.school_name = schoolData.data.school_name;
    })

    // get Class Name
    this.dashboardService.getClass(this.class_id).subscribe((classData: any) => {
      // console.log(classData);
      this.class_name = classData.data.class_name;
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
