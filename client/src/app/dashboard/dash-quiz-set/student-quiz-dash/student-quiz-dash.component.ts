import { Component, OnInit, ViewChild } from '@angular/core';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material';

@Component({
  selector: 'app-student-quiz-dash',
  templateUrl: './student-quiz-dash.component.html',
  styleUrls: ['./student-quiz-dash.component.css']
})
export class StudentQuizDashComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  currentUser: any;
  type_order: String;
  student_id: number;
  school_id: number;
  class_id: number;
  section_id: number;
  limit = 12;
  offset = 0;
  quizSetData: any;
  total_count: number;
  customFilters = {}
  quizSetLength: number;
  rowHeight: string = "650px";
  school_name: string;
  class_name: string;
  section_name: string;
  student_name: string;
  tempObj = {};
  constructor(private dashboardService: DashboardService,
    private route: ActivatedRoute) {  }

  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.route.params.subscribe(
      params => {
        this.school_id = +params['school_id'];
        this.class_id = +params['class_id'];
        this.section_id = +params['section_id'];
        this.student_id = +params['student_id'];
      }
    );
    this.breadcrumbs();
    this.customFilters = {
      user_id: this.currentUser.id,
      school_id: this.school_id,
      class_id: this.class_id,
      section_id: this.section_id,
      student_id: this.student_id,
      limit: this.limit,
      offset: this.offset
    }
    
    this.getStudentQuiz();

  }

  getStudentQuiz(){
    this.dashboardService.getDasboardQuizSets(this.customFilters).subscribe((quizSets: any) => {
      this.quizSetData = quizSets.data;      
      this.total_count = quizSets.total_count;

      this.quizSetLength = this.total_count;
        if(this.quizSetLength > 2){
          this.quizSetLength = 3;
          this.rowHeight = "480px"
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

breadcrumbs(){
  this.tempObj = {
    school_id: this.school_id,
    class_id: this.class_id,
    section_id: this.section_id,
    student_id: this.student_id
  }

  // get School Name
  this.dashboardService.getSchoolById(this.tempObj).subscribe((schoolData: any) => {
    // console.log(schoolData);
    this.school_name = schoolData.data.school_name;
  })

  // get Class Name
  this.dashboardService.getClass(this.class_id).subscribe((classData: any) => {
    // console.log(classData);
    this.class_name = classData.data.class_name;
  })

    // get Section Name
  this.dashboardService.getSection(this.tempObj).subscribe((sectionData: any) => {
    // console.log(sectionData);
    this.section_name = sectionData.data.class_section.section_name;
  })

  this.dashboardService.getStudentData(this.tempObj).subscribe((sectionData: any) => {
    // console.log(sectionData);
    this.student_name = sectionData.data.firstName + ' '+ sectionData.data.lastName;
  })

}

}
