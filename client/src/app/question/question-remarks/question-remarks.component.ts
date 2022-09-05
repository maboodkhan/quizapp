import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatTableDataSource } from '@angular/material';
import { QuestionService } from '../question.service';

@Component({
  selector: 'app-question-remarks',
  templateUrl: './question-remarks.component.html',
  styleUrls: ['./question-remarks.component.css']
})
export class QuestionRemarksComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  question_id:any;
  currentUser: any;
  dataSource: any;
  displayedColumns: string[] = ['Sno', 'remarks', 'givenBy', 'givenOn'];

  constructor(private dialogRef: MatDialogRef<QuestionRemarksComponent>,
    private questionService: QuestionService,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.question_id = data;
    }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.questionService.getRemark(this.question_id).subscribe((data: any) => {
      this.dataSource = new MatTableDataSource(data.data);
          this.dataSource.paginator = this.paginator;
    })
  }

  // applyFilter(filterValue: string) {
  //   filterValue = filterValue.trim(); // Remove whitespace
  //   filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
  //   this.dataSource.filter = filterValue;
  // }

}
