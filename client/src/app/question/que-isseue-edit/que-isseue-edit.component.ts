import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import { QuestionService } from '../question.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-que-isseue-edit',
  templateUrl: './que-isseue-edit.component.html',
  styleUrls: ['./que-isseue-edit.component.css']
})
export class QueIsseueEditComponent implements OnInit {

  private imgUrl = environment.imgUrl;
  issue_id: number;
  question_id: number;
  userData: any;
  pageTitle = 'User Data';
  feedback_from_user: any;
  class_name: string;
  subject_name: string;
  lesson_name: string;
  topic_name: string;
  readonly = false;
  currentUser: any;
  userId: number;
  user_name: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private questionService: QuestionService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = this.currentUser.id;

    this.route.params.subscribe(params => {
      this.issue_id = +params['issue_id'];
    });

    this.getQuestion();
  }

  getQuestion(){
    let obj = {
      issue_id: this.issue_id
    }
    this.questionService.getQueIssueById(obj).subscribe((data: any) => {
      this.userData = data.data;
      this.question_id = this.userData.question_id;
      this.feedback_from_user = this.userData.feedback_from_user;
      this.class_name = this.userData.class_id.class_name;
      this.subject_name = this.userData.subject_id.subject_name;
      this.lesson_name = this.userData.lesson_id.lesson_name;
      this.topic_name = this.userData.topic_id.topic_name;
      this.readonly = false;
      this.user_name = this.userData.webUsers.firstName+' '+this.userData.webUsers.lastName

      if(this.userData.webapp_user_id == this.userId){
        this.readonly = true;
      }
    });
  }

  edit(){
    // console.log(this.feedback_from_user);
    let obj = {
      issue_id: this.issue_id,
      feedback_from_user: this.feedback_from_user
    }
    this.questionService.updateQueIssueById(obj).subscribe((data: any) => {
      // console.log(data);
      if(data.status){
        this.router.navigate(['/questionIssues'],{queryParamsHandling: 'preserve'});
        this.openSnackBar("Feedback updated successfully. ", "Close");
      }
    })
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  cancel(){
    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.router.navigate(['/questionIssues'],{queryParamsHandling: 'preserve'});
      }else{
        this.router.navigate(['/viewIssue/', this.question_id],{queryParamsHandling: 'preserve'});
      }
    })
  }

}
