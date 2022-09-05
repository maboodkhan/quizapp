import { Component, OnInit, Inject } from '@angular/core';
import { QuestionService } from '../question.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-que-add-remarks',
  templateUrl: './que-add-remarks.component.html',
  styleUrls: ['./que-add-remarks.component.css']
})
export class QueAddRemarksComponent implements OnInit {

  inputData: any;
  question_id: any;
  remarks: string;
  currentUser: any;
  user_id: number;
  result: any =  {};

  constructor(private dialogRef: MatDialogRef<QueAddRemarksComponent>,
    private questionService: QuestionService,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.inputData = data;
      this.question_id = this.inputData.question_id;
    }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
  }

  remarksAdd(){
    if(this.remarks == ''  || this.remarks == undefined){
      this.result.message = "Remarks can't be empty.";
      return false;
    }
    let obj = {
      user_id: this.user_id,
      question_id: this.question_id,
      remarks: this.remarks
    }
    this.questionService.addRemark(obj).subscribe((data: any) => {
      // console.log(data);
      this.dialogRef.close();
    });
  }

}
