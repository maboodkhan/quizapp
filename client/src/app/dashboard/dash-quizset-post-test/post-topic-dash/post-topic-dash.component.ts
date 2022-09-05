import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { QuizSetService } from 'src/app/quiz-set/quiz-set.service';
import { PostDashboardService } from '../../post-dashboard.service';

@Component({
  selector: 'app-post-topic-dash',
  templateUrl: './post-topic-dash.component.html',
  styleUrls: ['./post-topic-dash.component.css']
})
export class PostTopicDashComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  currentUser: any;
  type_order: String;
  school_id: number;
  class_id: number;
  section_id: number;
  quiz_set_id: number;
  limit = 12;
  offset = 0;
  topicData: any;
  total_count: number;
  customFilters = {}
  quizSetLength: number;
  heading = false;
  school_name: string;
  class_name: string;
  section_name: string;
  set_name: string;
  rowHeight = '650px';
  tempObj = {};
  backTo: any;
  user_id: number;
  attempted_set_id: number;
  student_name: string;

  constructor(private postDashboardService: PostDashboardService,
    private dashboardService: DashboardService,
    private quizSetService: QuizSetService,
    private route: ActivatedRoute) {  }

  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    this.route.params.subscribe(
      params => {
        this.school_id = +params['school_id'];
        this.class_id = +params['class_id'];
        this.section_id = +params['section_id'];
        this.quiz_set_id = +params['quiz_id'];
      }
    );

    // this.customFilters = {
    //   user_id: this.currentUser.id,
    //   school_id: this.school_id,
    //   class_id: this.class_id,
    //   section_id: this.section_id,
    //   quiz_set_id: this.quiz_set_id,
    //   limit: this.limit,
    //   offset: this.offset
    // }

    this.route.queryParams.subscribe((paramsData: any) => {
      if(paramsData.backTo == 'quiz'){
        this.backTo = 1;
      }
      if(paramsData.user_id){
        this.user_id = parseInt(paramsData.user_id);
        this.attempted_set_id = parseInt(paramsData.attempted_set_id);
        this.customFilters = {
          user_id: this.user_id,
          school_id: this.school_id,
          class_id: this.class_id,
          section_id: this.section_id,
          quiz_set_id: this.quiz_set_id,
          limit: this.limit,
          offset: this.offset
        }
      }else{
        this.customFilters = {
          school_id: this.school_id,
          class_id: this.class_id,
          section_id: this.section_id,
          quiz_set_id: this.quiz_set_id,
          limit: this.limit,
          offset: this.offset
        }
      }
      // if(paramsData.type == 'list'){
      //   this.listOpen = paramsData.type;
      // }
    })

    this.getTopics();
    this.breadcrumbs();
  }

  getTopics(){
    // console.log(this.customFilters);
    this.postDashboardService.getQuizTopic(this.customFilters).subscribe((topics : any) => {
      this.topicData = topics.data;      
      this.total_count = topics.total_count;
      // console.log(this.topicData);
      this.quizSetLength = this.total_count;
        if(this.quizSetLength > 2){
          this.rowHeight = "450px";
          this.quizSetLength = 3;
          this.heading = true;
        }
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

breadcrumbs(){
  this.tempObj = {
    school_id: this.school_id,
    class_id: this.class_id,
    section_id: this.section_id,
    set_id: this.quiz_set_id
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
  });
  if(this.user_id){
    let obj = { student_id: this.user_id }
    this.dashboardService.getStudentData(obj).subscribe((studentData: any) => {
      // console.log(studentData);
      this.student_name = studentData.data.firstName + ' ' + studentData.data.lastName;
    })
  }
  this.quizSetService.getPostQuizSetDetails(this.tempObj).subscribe((quizDetail: any) => {
    // console.log(quizDetail);
    this.set_name = quizDetail.data.set_name;
  })
}

}
