import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { QuestionService } from '../question.service';

@Component({
  selector: 'app-both-assign',
  templateUrl: './both-assign.component.html',
  styleUrls: ['./both-assign.component.css']
})
export class BothAssignComponent implements OnInit {

  currentUser: any;
  user_id: number;
  customFilter = {};
  assign_id: number;
  review_id: number;
  result: any = {};
  questionIds: any;
  inputData: any;
  remarks: string;
  reviewerEdit: number = 0;

  constructor(private dialogRef: MatDialogRef<BothAssignComponent>,
    private questionService: QuestionService,
    @Inject(MAT_DIALOG_DATA) data) {
    this.inputData = data;
    this.questionIds = this.inputData.question_id;
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.customFilter = {
      user_id: this.currentUser.id
    }
  }

  onassignValue(assign_id){
    this.assign_id = assign_id
    // console.log(assign_id);
  }

  onreviewValue(review_id){
    this.review_id = review_id
    // console.log(review_id);
  }

  assignQuestion() {
    let obj = {}
    // console.log(this.assign_id);
    // console.log(this.review_id);
    if (this.assign_id == undefined) {
      this.result.message = "Please select a user to assign.";
      return false;
    }
    if (this.review_id == undefined) {
      obj = {
        question_id: this.questionIds,
        qc_assigned_to: this.assign_id,
        qc_assigned_by: this.user_id,
        reviewer_edit: this.reviewerEdit,
        remarks: this.remarks
      }
    }else{
      obj = {
        question_id: this.questionIds,
        qc_assigned_to: this.assign_id,
        qc_assigned_by: this.review_id,
        reviewer_edit: this.reviewerEdit,
        remarks: this.remarks
      }
    }

    this.questionService.assignQuestion(obj).subscribe((data: any) => {
      if (data.status) {
        this.dialogRef.close();
      }
    })
  }

  editPermissionChange(reviewerEdit){
    if(reviewerEdit == 0){
      this.reviewerEdit = 1;
    }else{
      this.reviewerEdit = 0;
    }
    // console.log(this.reviewerEdit);
  }

  closeDialog(){
    this.dialogRef.close(1);
  }

}
