import { Component, OnInit, Inject } from '@angular/core';
import { QuizSetService } from 'src/app/quiz-set/quiz-set.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { QuestionService } from '../question.service';

@Component({
  selector: 'app-quetion-preview',
  templateUrl: './quetion-preview.component.html',
  styleUrls: ['./quetion-preview.component.css']
})
export class QuetionPreviewComponent implements OnInit {

  question_id: any;
  questionData;
  showButton: boolean = false;
  userId: number;
  token: string;
  userType: string;
  currentUser: any;
  // remarks: string;

  constructor(private dialogRef: MatDialogRef<QuetionPreviewComponent>,
    private quizSetService: QuizSetService,
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
    // this.questionRemark();
    this.quizSetService.questionForPreview(this.question_id).subscribe((result: any) => {
      this.questionData = result.data;
      console.log(this.questionData);
      if(result.data.length > 0){
        // console.log(result.data[0]);
        if(result.data[0].qc_done == 2 
            && result.data[0].qc_assigned_by == this.userId){
          this.showButton = true;
        }
      }
    })
  }

  // questionRemark(){
  //   this.questionService.getRemark(this.question_id).subscribe((data: any) => {
  //     this.remarks = data.data.remarks;
  //   })
  // }

  // close() {
  //   this.dialogRef.close();
  // }

  // QcDone(qcDoneVal){
  //   // console.log(this.question_id);
  //   let obj = {
  //     question_id: this.question_id.question_id,
  //     qc_done: qcDoneVal,
  //     // remarks: this.remarks,
  //     created_by: this.userId
  //   }
  //   this.questionService.updateQcDone(obj).subscribe(data => {
  //   })
  // }

}
