import { Component, OnInit } from '@angular/core';
import { QuizSetService } from 'src/app/quiz-set/quiz-set.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-user-quiz-history',
  templateUrl: './user-quiz-history.component.html',
  styleUrls: ['./user-quiz-history.component.css']
})
export class UserQuizHistoryComponent implements OnInit {
  pageTitle : string;
  quizParams: any;
  sub: Subscription;
  quizVal: any;
  quizData: any;
  attempted_set_id: number;
  setId: number;
  isDashboard: boolean = false;
  school_name: string;
  class_name: string;
  section_name: string;
  tempObj = {};
  set_name: string;
  student_name: string;

  school_id: number;
  class_id: number;
  section_id: number;
  student_id: number;
  postTest = 0;

  constructor(
    private quizSetService: QuizSetService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(
      params => {
        this.school_id = +params['school_id'];
        this.class_id = +params['class_id'];
        this.section_id = +params['section_id'];
        this.student_id = +params['student_id'];
        this.setId = +params['id'];
        this.attempted_set_id = +params['set_id'];
      }
    )

    this.route.queryParams.subscribe((paramsData: any) => {
      if (paramsData.postTest) {
        this.pageTitle = 'Post Test Result Details';
        this.postTest = paramsData.postTest;
        this.getQuizSetData(this.attempted_set_id);
      }
      else{
        this.pageTitle = 'Quiz Result Details';
        this.getQuizSetData(this.attempted_set_id);
      }
    });

    if (this.school_id) {
      this.isDashboard = true;
    }
    this.breadcrumbs();
  }

  getQuizSetData(attempted_set_id) {
    this.quizParams = { attempted_set_id: attempted_set_id };
    if (this.postTest) {
      this.quizSetService.getPostUserQuizSetDetails(this.quizParams)
        .subscribe(quizData => {
          this.quizVal = quizData;
          this.quizData = this.quizVal.data.attempted_quiz_questions;
        });
    } else {
      this.quizSetService.getUserQuizSetDetails(this.quizParams)
        .subscribe(quizData => {
          this.quizVal = quizData;
          this.quizData = this.quizVal.data.attempted_quiz_questions;
        });
    }
  }

  breadcrumbs() {
    this.tempObj = {
      school_id: this.school_id,
      class_id: this.class_id,
      section_id: this.section_id,
      set_id: this.setId,
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
    });

    this.dashboardService.getStudentData(this.tempObj).subscribe((studentData: any) => {
      // console.log(studentData);
      this.student_name = studentData.data.firstName + ' ' + studentData.data.lastName;
    })
    if(this.postTest){
      this.quizSetService.getPostQuizSetDetails(this.tempObj).subscribe((quizDetail: any) => {
        // console.log(quizDetail);
        this.set_name = quizDetail.data.set_name;
      })
    }else{
      this.quizSetService.getQuizSetDetails(this.tempObj).subscribe((quizDetail: any) => {
        // console.log(quizDetail);
        this.set_name = quizDetail.data.set_name;
      })
    }
  }

}
