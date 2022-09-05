import { Component, OnInit } from '@angular/core';
import { QuizSetService } from 'src/app/quiz-set/quiz-set.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { isArray } from 'util';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-question-history',
  templateUrl: './question-history.component.html',
  styleUrls: ['./question-history.component.css']
})
export class QuestionHistoryComponent implements OnInit {

  pageTitle = 'Quiz Questions';
  private sub: Subscription;
  setId: number;
  quesValues: any;
  quesVal: any;
  quizVal: any;
  quizData: any;
  quizValues: any;
  quizClassInfo: any;
  classArr = [];
  sectionArr = [];
  class_id = [];
  section_id = [];
  filterClassId: any;
  filterSectionId: any;
  message: string = '';
  isDashboard: boolean = false;
  school_id: any;
  school_name: string;
  class_name: string;
  section_name: string;
  tempObj = {};
  set_name: string;
  postTest = 0;
  
  constructor(
    private quizSetService: QuizSetService,
    private dashboardService: DashboardService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {

    this.sub = this.route.params.subscribe((params) => {
      this.setId = +params['set_id'];
    });
    this.route.queryParams.subscribe((paramsData: any) => {

      if(paramsData.postTest){
        this.postTest = paramsData.postTest;
      }

      if(paramsData.school_id){
        this.school_id = parseInt(paramsData.school_id);
        this.isDashboard = true;
      }
      
      if (isArray(paramsData.class_id)) {
        this.class_id = paramsData.class_id.map(Number);
      } else {
        this.class_id[0] = parseInt(paramsData.class_id);
      }

      this.filterClassId = this.class_id;
      if (isArray(paramsData.section_id)) {
        this.section_id = paramsData.section_id.map(Number);
      } else {
        this.section_id[0] = parseInt(paramsData.section_id);
      }
      this.filterSectionId = this.section_id;
    });

    if(this.isDashboard){ this.breadcrumbs(); }
    
    this.changeClass(this.class_id, 1);
    this.getfilterClasses();
  }

  getQuizSetDataQues(){
    this.message = '';
    const quizParams = {
      quiz_set_id: this.setId,
      class_id: this.class_id,
      section_id: this.section_id
    };
    if(this.postTest){
      this.quizSetService.getPostQuizSetQues(quizParams)
      .subscribe(quizData => {
        this.quizVal = quizData;
        this.quizValues = this.quizVal.data;
        if (this.quizValues.length > 0) {
          this.quizData = this.quizValues[0].attempted_quiz_questions;
        } else {
          this.quizData = [];
          this.message = 'No student of this class/section attempt this quiz.';
        }
      }
    );
    }else{
      this.quizSetService.getQuizSetQues(quizParams)
      .subscribe(quizData => {
        this.quizVal = quizData;
        this.quizValues = this.quizVal.data;
        if (this.quizValues.length > 0) {
          this.quizData = this.quizValues[0].attempted_quiz_questions;
        } else {
          this.quizData = [];
          this.message = 'No student of this class/section attempt this quiz.';
        }
      }
    );
    }
    
  }


  getfilterClasses() {
    let quizObj = {
      quiz_set_id: this.setId
    }
    if(this.postTest){
      this.quizSetService.getPostQuizSetClassInfo(quizObj).subscribe((quizInfoRes: any) => {
        this.quizClassInfo = quizInfoRes.data;
        this.quizClassInfo.forEach(element => {
          this.classArr.push(element.quiz_class);
        });
        this.classArr = this.classArr.filter((thing, index, self) =>
          index === self.findIndex((t) => (
            t.id === thing.id
          ))
        );
      });
    }else{
      this.quizSetService.getQuizSetClassInfo(quizObj).subscribe((quizInfoRes: any) => {
        this.quizClassInfo = quizInfoRes.data;
        this.quizClassInfo.forEach(element => {
          this.classArr.push(element.quiz_class);
        });
        this.classArr = this.classArr.filter((thing, index, self) =>
          index === self.findIndex((t) => (
            t.id === thing.id
          ))
        );
      });
    }

  }

  changeSection(section_id) {
    this.section_id = section_id;
    this.getQuizSetDataQues();
  }


  changeClass(class_id, getClassVal = 0) {
    let quizObj;
    if (class_id[0] == null) {
      this.sectionArr = [];
      this.class_id = [];
      this.section_id = [];
      this.getQuizSetDataQues();
    }else{
      if(getClassVal == 0) {
        this.class_id = class_id;
        this.section_id = [];
        this.getQuizSetDataQues();
        quizObj = {
          quiz_set_id: this.setId,
          class_id: class_id
        };
      } else {
        this.class_id = class_id;
        this.getQuizSetDataQues();
        quizObj = {
          quiz_set_id: this.setId,
          class_id: class_id,
          section_id: this.section_id
        };
      }
      this.quizSetService.getQuizSetSectionInfo(quizObj).subscribe((quizInfoRes: any) => {
        this.sectionArr = quizInfoRes;
      });
    }      
  }

  breadcrumbs(){
    this.tempObj = {
      school_id: this.school_id,
      class_id: this.class_id[0],
      section_id: this.section_id[0],
      set_id: this.setId
    }
    // get School Name
    this.dashboardService.getSchoolById(this.tempObj).subscribe((schoolData: any) => {
      // console.log(schoolData);
      this.school_name = schoolData.data.school_name;
    })

    // get Class Name
    this.dashboardService.getClass(this.class_id[0]).subscribe((classData: any) => {
    // console.log(classData);
      this.class_name = classData.data.class_name;
    })

      // get Section Name
    this.dashboardService.getSection(this.tempObj).subscribe((sectionData: any) => {
      // console.log(sectionData);
      this.section_name = sectionData.data.class_section.section_name;
    });

    this.quizSetService.getQuizSetDetails(this.tempObj).subscribe((quizDetail: any) => {
      // console.log(quizDetail);
      this.set_name = quizDetail.data.set_name;
    })
  }


}
