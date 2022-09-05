import { Component, OnInit, Inject } from '@angular/core';
import { QuestionService } from '../question.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-move-question',
  templateUrl: './move-question.component.html',
  styleUrls: ['./move-question.component.css']
})
export class MoveQuestionComponent implements OnInit {

  question_id:any;
  currentUser: any;
  user_id: number;
  classes: any;
  subjects: any;
  lessons: any;
  topics: any;
  class_id: number;
  subject_id: number;
  lesson_id: number;
  topic_id: number;
  isDisabled = true;

  constructor(private dialogRef: MatDialogRef<MoveQuestionComponent>,
    private questionService: QuestionService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.question_id = data;
    }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser) {
      this.user_id = this.currentUser.id;
    }
    const paramsVal = { board_id: 1 };
    this.questionService.getClasses(paramsVal).subscribe((result: any) => {
      this.classes = result.data;
    });
  }

  changeClass(strVal, defaultVal = 0) {
    const paramsVal = { class_id: [strVal] };
    this.questionService.getSubjects(paramsVal).subscribe((result: any) => {
      this.subjects = result.data;
      this.lesson_id = null;
      this.topic_id = null;
      this.isDisabled = true;
    });
  }

  changeSubject(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    this.questionService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessons = result.data;
      this.topic_id = null;
      this.isDisabled = true;
    });
  }

  changeLesson(strVal, defaultVal = 0) {
    const paramsVal = { lesson_id: [strVal] };
    this.questionService.getTopics(paramsVal).subscribe((result: any) => {
      this.topics = result.data;
      this.isDisabled = true;
    });
  }

  changeTopic(){
    if(this.topic_id){
      this.isDisabled = false;
    }
  }

  close() {
    this.dialogRef.close();
  }

  moveQues(){
    let changeObj = {
      question_id: this.question_id.question_id, 
      syllabus_id: this.topic_id,
      user_id: this.user_id
    }
    this.questionService.changeSyllabus(changeObj).subscribe((data: any) => {
      if(data.status){
        this.openSnackBar('Question moved successfully. ', 'Close');
        this.dialogRef.close();
      }
    })
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
        duration: 1500,
    });
  }

}
