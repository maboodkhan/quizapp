import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { QuestionService } from '../question.service';
import { QuizSetService } from 'src/app/quiz-set/quiz-set.service';

@Component({
  selector: 'app-both-preview',
  templateUrl: './both-preview.component.html',
  styleUrls: ['./both-preview.component.css']
})
export class BothPreviewComponent implements OnInit {

  question_id: any;
  questionData;
  showButton: boolean = false;
  userId: number;
  currentUser: any;
  remarks: string;
  showOld: boolean = false;

  constructor(private dialogRef: MatDialogRef<BothPreviewComponent>,
    private quizSetService: QuizSetService,
    private questionService: QuestionService,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.question_id = data;
    }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser) {
      this.userId = this.currentUser.id;
    }
    this.quizSetService.questionForPreview(this.question_id).subscribe((result: any) => {
      this.questionData = result.data;
      if(result.data.length > 0){
        // console.log(result.data[0]);
        if(result.data[0].qc_done == 2 
            && result.data[0].qc_assigned_by == this.userId){
          this.showButton = true;
        }
      }
    });
    this.oldQuestion();
  }

  oldQuestion(){
    this.questionService.getPreviousData(this.question_id).subscribe((result: any) => {
      if(result.data.length > 0){
        this.showOld= true;
      }
      
    });
  }

  close() {
    this.dialogRef.close();
  }

  QcDone(qcDoneVal){
    // console.log(this.question_id);
    let obj = {
      question_id: this.question_id.question_id,
      qc_done: qcDoneVal,
      remarks: this.remarks,
      created_by: this.userId
    }
    this.questionService.updateQcDone(obj).subscribe(data => {
    })
  }

}
