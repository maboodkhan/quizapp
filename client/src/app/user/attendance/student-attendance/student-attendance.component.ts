import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog, MatPaginator, MatSort, MatTableDataSource, MatOption, MatSnackBar } from '@angular/material';
// import { UserService } from '../user.service';
// import { FormsModule } from '@angular/forms';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-student-attendance',
  templateUrl: './student-attendance.component.html',
  styleUrls: ['./student-attendance.component.css']
})
export class StudentAttendanceComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;
  dataSource: any;
  displayedColumns: string[] = ['S_No', 'name', 'email', 'subject', 'attendanceDate', 'attendanceStatus', 'id'];
  pageTitle = 'Student Attendance';
  limit = 10;
  offset = 0;
  total_students: number;
  customFilters: any = null;
  currentUser: any;
  user_id: number;
  type_order: number;
  userData = [];
  userDataSchool = [];

  searchFilter: any = {
    studentName: '',
    from_date: '',
    to_date: '',
    limit: 10,
    offset: 0
  };

  constructor(public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;
    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        this.searchFilter = this.customFilters;
        this.offset = this.paginator.pageIndex = (this.customFilters.offset / this.customFilters.limit);
        this.limit = this.paginator.pageSize = this.customFilters.limit;
      } else {
        this.customFilters = {
          studentUserId: this.user_id,
          limit: this.paginator.pageSize,
          offset: this.paginator.pageIndex * this.paginator.pageSize
        }
      }
    })
    this.getUserData();
  }

  getUserData() {
    this.customFilters = {
      from_date: this.customFilters.from_date,
      to_date: this.customFilters.to_date,
      school_id: [2],
      class_id: [7],
      section_id: [1],
      subject_id: [1],
      studentUserId: 67118911,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    // console.log(this.customFilters);
    this.userService.getStudentAttendance(this.customFilters).subscribe((result: any) => {
      // console.log(result);
      this.total_students = result.totalCount;
      this.dataSource = new MatTableDataSource(result.data);
      // this.dataSource.paginator = this.paginator;
      // this.dataSource.sort = this.sort;
    });
  }


  resetPage() {
    this.getUserData();
  }

  searchUserData(filters: any) {
    this.resetPageIndex();
    // console.log(filters.fromDate);
    filters.studentUserId = this.user_id;
    filters.limit = this.paginator.pageSize;
    filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
    this.customFilters = filters;
    this.getUserData();
  }

  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.customFilters = {
      studentUserId: this.user_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    this.getUserData();
  }

  resetPageIndex() {
    this.paginator.pageIndex = 0;
  }


  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  ngAfterViewInit() {

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getUserData();
        })
      )
      .subscribe();
  }

}
