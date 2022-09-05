import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DashboardService } from '../../dashboard.service';
import { QuizSetService } from 'src/app/quiz-set/quiz-set.service';

@Component({
  selector: 'app-quiz-info-dashboard',
  templateUrl: './quiz-info-dashboard.component.html',
  styleUrls: ['./quiz-info-dashboard.component.css']
})
export class QuizInfoDashboardComponent implements OnInit {

  inputData: any;

  school_id: number;
  class_id: number;
  section_id: number;
  quiz_set_id: number;
  limit = 100;
  offset = 0;
  customFilter = {};
  topicData: any;
  quizData: any;
  constructor(private dialogRef: MatDialogRef<QuizInfoDashboardComponent>,
    private dashboardService: DashboardService,
    private quizSetService: QuizSetService,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.inputData = data;
    }

  ngOnInit() {
    // console.log(this.inputData);

    // this.customFilter = {
    //   school_id
    // }
    this.getQuizTopics();
    this.getQuizDetail();
  }

  getQuizTopics(){
    this.dashboardService.getQuizTopic(this.inputData).subscribe((topic: any) => {
      // console.log(topic);
      this.topicData = topic.data;
    })
  }

  getQuizDetail(){
    let obj = {
      set_id: this.inputData.quiz_set_id
    }
    this.quizSetService.getQuizSetDetails(obj).subscribe((quizDetail: any) => {
      // console.log(quizDetail);
      this.quizData = quizDetail.data
      // this.set_name = quizDetail.data.set_name;
    })
  }

  

}
