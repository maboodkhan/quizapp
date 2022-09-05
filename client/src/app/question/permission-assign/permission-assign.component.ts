import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { QuestionService } from '../question.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-permission-assign',
  templateUrl: './permission-assign.component.html',
  styleUrls: ['./permission-assign.component.css']
})
export class PermissionAssignComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns = ['id'];
  assigned_id: any;
  currentUser: any;
  user_id: number;
  user_type_id: number;
  assignUser: any;
  dataSource: any;
  customFilter = {};
  result: any =  {};
  questionIds: any;
  // permission: number;
  remarks: string;
  topic_id = [];

  constructor(private dialogRef: MatDialogRef<PermissionAssignComponent>,
    private questionService: QuestionService,
    @Inject(MAT_DIALOG_DATA) data: any) { 
      this.topic_id = data.topic_id;
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


    assignPermission(){
      if(this.assigned_id == ''  || this.assigned_id == undefined){
        this.result.message = "Please select a user to assign.";
        return false;
      }

      let obj = {
        topic_id: this.topic_id,
        user_id: this.assigned_id
      }
      this.questionService.addPermission(obj).subscribe((data: any) => {
        if(data.status) {
          this.dialogRef.close();
        }
      })
    }
  
    applyFilter(filterValue: string) {
      filterValue = filterValue.trim(); // Remove whitespace
      filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
      this.dataSource.filter = filterValue;
    }

    closeDialog(){
      this.dialogRef.close(1);
    }

}
