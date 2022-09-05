import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { QuestionService } from '../question.service';

@Component({
  selector: 'app-question-logs',
  templateUrl: './question-logs.component.html',
  styleUrls: ['./question-logs.component.css']
})


export class QuestionLogsComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  question_id:any;
  currentUser: any;
  dataSource: any;
  displayedColumns: string[] = ['Sno', 'user', 'action', 'description', 'date'];

  constructor(private dialogRef: MatDialogRef<QuestionLogsComponent>,
    private questionService: QuestionService,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.question_id = data;
    }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.questionService.questionLogs(this.question_id).subscribe((data: any) => {
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
