import { Component, OnInit, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { QuestionService } from '../question.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-question-assign',
  templateUrl: './question-assign.component.html',
  styleUrls: ['./question-assign.component.css']
})
export class QuestionAssignComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns = ['id'];
  qc_assigned_to: any;
  inputData: any;
  currentUser: any;
  user_id: number;
  user_type_id: number;
  assignUser: any;
  dataSource: any;
  customFilter = {};
  result: any = {};
  questionIds: any;
  // permission: number;
  remarks: string;
  @Output() assignValue = new EventEmitter<any>();

  constructor(private dialogRef: MatDialogRef<QuestionAssignComponent>,
    private questionService: QuestionService,
    @Inject(MAT_DIALOG_DATA) data) {
    this.inputData = data;
    this.questionIds = this.inputData.question_id;
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.customFilter = {
      user_id: this.currentUser.id,
      user_type_id: this.currentUser.user_Type.id
    }
    this.questionService.getAssignUsers(this.customFilter).subscribe((data: any) => {
      this.assignUser = data.data;
      this.dataSource = new MatTableDataSource(data.data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data, filter: string)  => {      
        // Transform the filter by converting it to lowercase and removing whitespace.
        const transformedFilter = filter.trim().toLowerCase();
        let firstName = data.firstName.substr(0,transformedFilter.length).toLowerCase();
        let username = data.username.substr(0,transformedFilter.length).toLowerCase();
        // console.log(data.firstName.substr(0,transformedFilter.length).toLowerCase()+" == "+transformedFilter);
        return  (firstName == transformedFilter || username == transformedFilter) ? true: false;
      };
    })
  }

  selectAssign(assign_id){
    this.assignValue.emit(assign_id);
  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    // filterValue = filterValue.startsWith();
    this.dataSource.filter = filterValue;
  }

}
