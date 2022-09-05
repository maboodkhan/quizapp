
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog, MatPaginator, MatSort, MatTableDataSource, MatOption, MatSnackBar } from '@angular/material';
// import { UserService } from './user.service';
// import { FormsModule } from '@angular/forms';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../user.service';
import { DownloadAttendanceService } from '../download-attendance.service';
import { DatePipe } from '@angular/common';
import { OnlineScheduleService } from 'src/app/online-schedule/online-schedule.service';

@Component({
  selector: 'app-teacher-attendance',
  templateUrl: './teacher-attendance.component.html',
  styleUrls: ['./teacher-attendance.component.css'],
  providers: [DatePipe]
})
export class TeacherAttendanceComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;
  dataSource: any;
  displayedColumns: string[] = ['S_No', 'name', 'email', 'class', 'subject', 'duration', 'attendanceDate', 'attendanceStatus', 'id'];
  pageTitle = 'Attendance';
  limit = 10;
  offset = 0;
  total_students: number;
  customFilters: any = null;
  currentUser: any;
  user_id: number;
  type_order: number;
  userData = [];
  userDataSchool = [];
  classList: any;
  sectionIdArr = [];
  schoolList: any;
  sectionList: any;
  subjectList: any;
  schedule_id: number;
  downloadData = [];
  downloadArr = [];
  scheduleStartDate: any;
  scheduleEndDate: any;
  cstmFltr: any = null;

  searchFilter: any = {
    studentName: '',
    from_date: '',
    to_date: '',
    school_id: [],
    class_id: [],
    section_id: [],
    subject_id: [],
    limit: 10,
    offset: 0
  };

  constructor(public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private onlineScheduleService: OnlineScheduleService,
    public datepipe: DatePipe,
    private downloadService: DownloadAttendanceService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;
    if (this.type_order == 1 || this.type_order == 2) {
      this.user_id = undefined;
      // console.log(this.user_id);
    }
    this.route.params.subscribe(params => {
      this.schedule_id = +params['schedule_id'];
    });
    this.userService.getActiveSchools(this.user_id).subscribe((data: any) => {
      this.schoolList = data.data;
    });
    this.route.queryParams.subscribe((params: any) => {
      if(params.cstmFltr){
        this.cstmFltr = JSON.parse(params.cstmFltr);
      }
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        this.searchFilter = this.customFilters;
        if (this.customFilters.class_id != '') {
          this.changeClass(this.customFilters.class_id, 1);
        }
        this.offset = this.paginator.pageIndex = (this.customFilters.offset / this.customFilters.limit);
        this.limit = this.paginator.pageSize = this.customFilters.limit;
      } else {
        this.customFilters = {
          takenBy: this.user_id,
          limit: this.paginator.pageSize,
          offset: this.paginator.pageIndex * this.paginator.pageSize
        }
      }
    })
    this.getUserData();
    let classObj = {
      board_id: 1
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });

  }

  getUserData() {
    this.customFilters = {
      studentName: this.customFilters.studentName,
      from_date: this.customFilters.from_date,
      to_date: this.customFilters.to_date,
      school_id: this.customFilters.school_id,
      class_id: this.customFilters.class_id,
      section_id: this.customFilters.section_id,
      subject_id: this.customFilters.subject_id,
      // takenBy: this.user_id,
      schedule_id: this.schedule_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    this.userData = [];
    // console.log(this.customFilters);
    this.userService.getAttendanceList(this.customFilters).subscribe((result: any) => {
      this.total_students = result.totalCount;
      // console.log(result);
      result.data.forEach(element => {
        if (element.startTime != null && element.endTime != null) {
          var startTime = new Date(element.startTime).getTime();
          var endTime = new Date(element.endTime).getTime();
          var duration = endTime - startTime
          duration = 1000 * Math.round(duration / 1000);
          var d = new Date(duration);
          element.duration = d.getUTCHours() + ':' + d.getUTCMinutes() + ':' + d.getUTCSeconds();
          this.userData.push(element);
        } else {
          element.duration = "";
          this.userData.push(element);
        }
      });
      this.dataSource = new MatTableDataSource(this.userData);
      // this.downloadService.downloadFile(this.userData, 'attendance');
      // this.dataSource.paginator = this.paginator;
      // this.dataSource.sort = this.sort;
    });
  }

  changeClass(class_id, defaultVal = 0) {
    this.sectionIdArr = class_id;
    let classObj = { class_id: this.sectionIdArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
    })
    this.userService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
  }

  selectAllSection() {
    let sectionVal = [0];
    if (this.allSelectedSection.selected) {

      this.sectionList.forEach(element => {
        sectionVal.push(element.id);
      });
      this.searchFilter.section_id = sectionVal;
    } else {
      this.searchFilter.section_id = []
    }
  }

  tosslePerSection() {
    if (this.allSelectedSection.selected) {
      this.allSelectedSection.deselect();
      // this.searchFilter.section_id = [];
      return false;
    }
    if (this.searchFilter.section_id.length === this.sectionList.length) {
      this.allSelectedSection.select();
    }
  }

  resetPage() {
    this.userData = [];
    this.getUserData();
  }

  searchUserData(filters: any) {
    this.resetPageIndex();
    this.userData = [];
    // console.log(filters.fromDate);
    filters.takenBy = this.user_id;
    filters.limit = this.paginator.pageSize;
    filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
    this.customFilters = filters;
    this.getUserData();
  }

  resetSearchFilter(searchPanel: any) {
    this.userData = [];
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.customFilters = {
      takenBy: this.user_id,
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

  //   attendanceDate: "2020-10-14T00:00:00.000Z"
  // attendanceStatus: "P"
  // class_id: 7
  // class_name: "Grade 7"
  // email: "shashwatg3@gmail.com"
  // endTime: "2020-06-10T11:57:02.000Z"
  // firstName: "Mannat"
  // id: 6
  // lastName: "Verma"
  // offlineAttendance: 0
  // schedule_id: 24
  // school_id: 2
  // section_id: 1
  // section_name: "A"
  // startTime: "2020-06-10T11:40:42.000Z"
  // studentUserId: 67118911
  // subject_id: 2
  // subject_name: "Science"
  // takenBy: 2

  downloadAttendance() {

    let scheduleObj = { schedule_id: this.schedule_id }
    this.onlineScheduleService.getScheduleById(scheduleObj).subscribe((schedleData: any) => {
      this.scheduleStartDate = this.datepipe.transform(schedleData.data.start_date, 'dd-MM-yyyy h:mm a');
      this.scheduleEndDate = this.datepipe.transform(schedleData.data.end_date, 'dd-MM-yyyy h:mm a');
    });

    let attendanceObj = this.customFilters;
    attendanceObj.offset = 0;
    attendanceObj.limit = 1000;
    this.userService.getAttendanceList(this.customFilters).subscribe((result: any) => {
      this.downloadData = result.data;
      this.downloadData.forEach(download => {
        let attendaneDate = this.datepipe.transform(download.attendanceDate, 'dd-MM-yyyy h:mm a');
        let startTime = this.datepipe.transform(download.startTime, 'dd-MM-yyyy h:mm a');
        let endTime = this.datepipe.transform(download.endTime, 'dd-MM-yyyy h:mm a');

        let downloadObj = {
          studentName: download.firstName + ' ' + download.lastName,
          email: download.email,
          class: download.class_name,
          subject: download.subject_name,
          scheduleStartDate: this.scheduleStartDate,
          scheduleEndDate: this.scheduleEndDate,
          attendanceDate: attendaneDate,
          startTime: startTime,
          endTime: endTime,
          attendanceStatus: download.attendanceStatus
        }
        this.downloadArr.push(downloadObj);
      });
      // console.log(this.reportArr);
      this.downloadService.downloadFile(this.downloadArr, 'attendance');
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
