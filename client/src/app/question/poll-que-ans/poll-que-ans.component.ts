import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../question.service';
import { GenericValidator } from 'src/app/shared';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-poll-que-ans',
  templateUrl: './poll-que-ans.component.html',
  styleUrls: ['./poll-que-ans.component.css']
})
export class PollQueAnsComponent implements OnInit {
  currentUser: any;
  user_id: number;
  pollQuestion: any;
  pollQueAnsArr = [];
  comments: string;
  errorMessage: any;
  sub: Subscription;
  teacherUserId: number;
  studentUserId: number;
  schedule_id: number;
  queryParameter: any;
  qVals = [];

  // private validationMessages: { [key: string]: { [key: string]: string } };
  // private genericValidator: GenericValidator;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private questionService: QuestionService) {

    // this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(this.currentUser){
      this.user_id = this.currentUser.id;
    }
    this.sub = this.route.queryParams.subscribe(
      params => {
        this.queryParameter = Object.keys(params)[0]
        this.queryParameter = atob(this.queryParameter);
        this.queryParameter = this.queryParameter.split('&');
        this.queryParameter.forEach(qpVal => {
          let nqVal = qpVal.split("=");
          let aqVal = {};
          aqVal[nqVal[0]] = nqVal[1];
          this.qVals.push(aqVal);         
          //this.qVals.push(qVal.split("="));
        });
        this.qVals.forEach((qVal,index)=>{
          this.schedule_id = this.qVals[0].schedule_id;
          this.teacherUserId = this.qVals[1].teacher_id;
          this.studentUserId = this.qVals[2].student_id;
        });
      }
    )
    this.getQuestions();
  }

  getQuestions(){
    let obj = {}
    this.questionService.getPollQuestions(obj).subscribe((result: any)=> {
      // console.log(result);
      this.pollQuestion = result.data;
    })
  }

  optionAns(question_id, answer_id){

    let pollObj = {
      poll_question_id: question_id,
      poll_answer_id: answer_id,
      comments: this.comments
    }
    this.pollQueAnsArr = this.pollQueAnsArr.filter((obj) => obj.poll_question_id != question_id)
    this.pollQueAnsArr.push(pollObj);
    // console.log(this.pollQueAnsArr);
  }

  savepollAns(){
    let saveObj = {
      teacherUserId: this.teacherUserId,
      studentUserId: this.studentUserId,
      schedule_id: this.schedule_id,
      pollQueAnsArr: this.pollQueAnsArr,
      comments: this.comments,
      created_on: new Date()
    }
    this.questionService.addUserAnswer(saveObj).subscribe((response: any)=> {
      this.errorMessage = response;
    })
  }

}
