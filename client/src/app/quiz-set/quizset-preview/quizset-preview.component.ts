import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { QuizSetService } from '../quiz-set.service';

@Component({
  selector: 'app-quizset-preview',
  templateUrl: './quizset-preview.component.html',
  styleUrls: ['./quizset-preview.component.css']
})
export class QuizsetPreviewComponent implements OnInit {

  question_id = [];
  questionData;

  constructor(private dialogRef: MatDialogRef<QuizsetPreviewComponent>,
    private quizSetService: QuizSetService,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.question_id = data;
    }

  ngOnInit() {    
    this.quizSetService.questionForPreview(this.question_id).subscribe((result: any) => {
      this.questionData = result.data;
    })
  }

  close() {
    this.dialogRef.close();
  }

}
