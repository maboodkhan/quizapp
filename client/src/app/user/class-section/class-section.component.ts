import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { UserService } from '../user.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'app-class-section',
  templateUrl: './class-section.component.html',
  styleUrls: ['./class-section.component.css']
})
export class ClassSectionComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns = ['S_No', 'school', 'class', 'section'];
  school_data_id;
  userDataSchool = [];
  dataSource: any;
  constructor(private dialogRef: MatDialogRef<ClassSectionComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) data) {
    this.school_data_id = data;
  }

  ngOnInit() {
    // let obj = { school_data_id: this.school_data_id }
    this.userService.userClassSection(this.school_data_id).subscribe((result: any) => {
      // console.log(result.data);
      this.userDataSchool = result.data.filter((userDataSchool, index, self) =>
        index === self.findIndex((t) => (
          t.school_id === userDataSchool.school_id &&
          t.class_id === userDataSchool.class_id && t.section_id === userDataSchool.section_id
        ))
      )
      this.dataSource = new MatTableDataSource(this.userDataSchool);
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

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

}
