import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DashboardService } from '../../dashboard.service';
import { QuizSetService } from 'src/app/quiz-set/quiz-set.service';
import { PostDashboardService } from '../../post-dashboard.service';

@Component({
  selector: 'app-post-quiz-info-dash',
  templateUrl: './post-quiz-info-dash.component.html',
  styleUrls: ['./post-quiz-info-dash.component.css']
})
export class PostQuizInfoDashComponent implements OnInit {

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
  constructor(private dialogRef: MatDialogRef<PostQuizInfoDashComponent>,
    private postDashboardService: PostDashboardService,
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
    this.postDashboardService.getQuizTopic(this.inputData).subscribe((topic: any) => {
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

