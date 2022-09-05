import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { QuestionService } from '../question.service';

@Component({
  selector: 'app-old-preview',
  templateUrl: './old-preview.component.html',
  styleUrls: ['./old-preview.component.css']
})
export class OldPreviewComponent implements OnInit {

  question_id: any;
  questionData;
  showButton: boolean = false;
  userId: number;
  token: string;
  userType: string;
  currentUser: any;
  remarks: string;
  question: string;
  solution: string;
  answerOption = [];
  rightanswer= [];
  showData: boolean=false;

  constructor(private dialogRef: MatDialogRef<OldPreviewComponent>,
    // private quizSetService: QuizSetService,
    private questionService: QuestionService,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.question_id = data;
    }

    ngOnInit() {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
      if (this.currentUser) {
        this.userId = this.currentUser.id;
        this.token = this.currentUser.token;
        this.userType = this.currentUser.userType;
      }
      this.questionService.getPreviousData(this.question_id).subscribe((result: any) => {
        this.questionData = result.data;
        this.questionData.forEach(qd => {
          if(qd.type_value == 'question'){
            this.question = qd.question_value
          }else if(qd.type_value == 'solution'){
            this.solution = qd.question_value
          }else if(qd.type_value == "answer"){
            this.answerOption.push(qd.question_value);
          }else if(qd.type_value == 'right_answer'){
            this.rightanswer.push(qd.question_value);
          }
        });
        this.showData= true;
      });
    }

}
