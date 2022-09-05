import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog, MatPaginator, MatSort, MatTableDataSource, MatOption, MatSnackBar } from '@angular/material';
// import { UserService } from '../user.service';
// import { FormsModule } from '@angular/forms';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/user/user.service';
import { DatePipe } from '@angular/common';
import { DownloadStudentService } from '../download-student.service';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-student-atten-report',
  templateUrl: './student-atten-report.component.html',
  styleUrls: ['./student-atten-report.component.css'],
  providers: [DatePipe]
})

export class StudentAttenReportComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;
  dataSource: any;
  displayedColumns: string[] = ['S_No', 'name', 'email', 'class', 'subject', 'attendanceDate', 'classStart', 'classEnd', 'startTime', 'endTime', 'duration', 'attendanceStatus'];
  pageTitle = 'Student Attendance Report';
  limit = 10;
  offset = 0;
  total_students: number;
  customFilters: any = null;
  currentUser: any;
  user_id: number;
  type_order: number;
  userData = [];
  userDataSchool = [];
  schoolArr = [];
  classArr = [];
  sectionArr = [];
  schoolList: any;
  classList: any;
  sectionList: any;
  subjectList: any;
  downloadArr = [];
  selectClassId = [];
  studentList = []

  searchFilter: any = {
    // teacherName: '',
    from_date: '',
    to_date: '',
    school_id: [],
    class_id: [],
    section_id: [],
    studentUserId: [],
    subject_id: [],
    status: 0,
    limit: 10,
    offset: 0
  };

  constructor(public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private reportService: ReportService,
    private downloadStudentService: DownloadStudentService,
    public datepipe: DatePipe) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;
    if (this.type_order == 1 || this.type_order == 2) {
      this.customFilters = {};
      this.userService.getActiveSchools(this.user_id).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.getUserClasses();
        this.getUserData();
      });
    } else {
      let obj = { user_id: this.user_id }
      // console.log(obj);
      this.userService.userSchools(obj).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.classArr = data.userClass;
        this.sectionArr = data.userSection;
        this.getUserClasses();
        // if(params)
        // console.log(this.customFilters);
        // if (Object.keys(this.customFilters).length === 0) {
        this.customFilters = {
          school_id: this.schoolArr,
          class_id: this.classArr,
          section_id: this.sectionArr,
          limit: this.paginator.pageSize,
          offset: this.paginator.pageIndex * this.paginator.pageSize
        }
        // }
        this.getUserData();
      });
    }

  }

  getUserData() {
    this.customFilters = {
      from_date: this.customFilters.from_date,
      to_date: this.customFilters.to_date,
      school_id: this.customFilters.school_id,
      class_id: this.customFilters.class_id,
      section_id: this.customFilters.section_id,
      studentUserId: this.customFilters.studentUserId,
      subject_id: this.customFilters.subject_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    this.userData = [];
    console.log(this.customFilters);
    this.userService.getStudentAttendance(this.customFilters).subscribe((result: any) => {
      console.log(result);
      this.total_students = result.totalCount;
      result.data.forEach(el => {

        if (el.onlineSchedule) {
          if (el.onlineSchedule.zoomClass.length == 1) {
            el.onlineSchedule.startTime = el.onlineSchedule.start_date
            el.onlineSchedule.endTime = el.onlineSchedule.zoomClass[0].created_on;
          } else if (el.onlineSchedule.zoomClass.length > 1) {
            el.onlineSchedule.startTime = el.onlineSchedule.start_date
            el.onlineSchedule.endTime = el.onlineSchedule.zoomClass[el.onlineSchedule.zoomClass.length - 1].created_on;
          } else {
            el.onlineSchedule.startTime = 0;
            el.onlineSchedule.endTime = 0;
          }
        }

        if (el.startTime != null && el.endTime != null) {
          var startTime = new Date(el.startTime).getTime();
          var endTime = new Date(el.endTime).getTime();
          var duration = endTime - startTime
          duration = 1000 * Math.round(duration / 1000);
          var d = new Date(duration);
          el.duration = d.getUTCHours() + ':' + d.getUTCMinutes() + ':' + d.getUTCSeconds();
          this.userData.push(el);
        } else {
          el.duration = "";
          this.userData.push(el);
        }
      });
      this.dataSource = new MatTableDataSource(this.userData);
      // this.dataSource.paginator = this.paginator;
      // this.dataSource.sort = this.sort;
    });
  }

  getUserClasses() {
    let classObj = {
      board_id: 1,
      class_id: this.classArr
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });
  }

  changeSchool(){
    this.getStudent();
  }

  changeClass(class_id, defaultVal = 0) {
    this.getStudent();
    this.selectClassId = class_id;
    let classObj = { class_id: class_id, section_id: this.sectionArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
    })
    this.userService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
  }

  changeSection(){
    this.getStudent();
  }

  getStudent(){
    this.studentList = [];
    if(this.searchFilter.section_id.length > 0){
      // this.searchFilter.section_id
      this.searchFilter.section_id = this.searchFilter.section_id.filter((id) => {
        return id != 0
      });
    }
    let obj = {
      school_id: this.searchFilter.school_id,
      class_id: this.searchFilter.class_id,
      section_id: this.searchFilter.section_id
    }
    console.log(obj);
    this.reportService.getQuizStudent(obj).subscribe((data: any)=> {
      data.result.forEach(element => {
        if(element.quiz_user_data){
          this.studentList.push(element.quiz_user_data);
        }
      });
    })
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
    this.getUserData();
  }

  searchUserData(filters: any) {
    this.resetPageIndex();
    this.userData = [];
    if (filters) {
      if (!filters.school_id || filters.school_id.length <= 0) {
        filters.school_id = this.schoolArr;
      }
      if (!filters.class_id || filters.class_id.length <= 0) {
        filters.class_id = this.classArr;
      }
      if (!filters.section_id || filters.section_id.length <= 0) {
        filters.section_id = this.sectionArr;
      }

      filters.limit = this.paginator.pageSize;
      filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
      this.customFilters = filters;
      this.getUserData();
    }
  }

  resetSearchFilter(searchPanel: any) {
    this.userData = [];
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.sectionArr = null;
    this.customFilters = {
      school_id: this.schoolArr,
      class_id: this.classArr,
      section_id: this.sectionArr,
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

  downloadAttendance() {
    this.downloadArr = [];
    let attendanceObj = this.customFilters;
    attendanceObj.offset = 0;
    attendanceObj.limit = 1000;
    this.userService.getStudentAttendance(this.customFilters).subscribe((result: any) => {
      // console.log(result);
      result.data.forEach(element => {

        if (element.onlineSchedule) {
          if (element.onlineSchedule.zoomClass.length == 1) {
            element.onlineSchedule.classStartTime = element.onlineSchedule.start_date
            element.onlineSchedule.classEndTime = element.onlineSchedule.zoomClass[0].created_on;
          } else if (element.onlineSchedule.zoomClass.length > 1) {
            element.onlineSchedule.classStartTime = element.onlineSchedule.start_date
            element.onlineSchedule.classEndTime = element.onlineSchedule.zoomClass[element.onlineSchedule.zoomClass.length - 1].created_on;
          } else {
            element.onlineSchedule.classStartTime = 0;
            element.onlineSchedule.classEndTime = 0;
          }
        }

        if (element.startTime != null && element.endTime != null) {
          let startTime = new Date(element.startTime).getTime();
          let endTime = new Date(element.endTime).getTime();
          var duration = endTime - startTime
          duration = 1000 * Math.round(duration / 1000);
          var d = new Date(duration);
          element.duration = d.getUTCHours() + ':' + d.getUTCMinutes() + ':' + d.getUTCSeconds();
        } else {
          element.duration = "";
        }
        let attendaneDate = this.datepipe.transform(element.attendanceDate, 'dd-MM-yyyy h:mm a');
        let start_Time = this.datepipe.transform(element.startTime, 'dd-MM-yyyy h:mm a');
        let end_Time = this.datepipe.transform(element.endTime, 'dd-MM-yyyy h:mm a');
        let class_startTime;
        let class_endTime;
        if (element.onlineSchedule) {
          class_startTime = this.datepipe.transform(element.onlineSchedule.classStartTime, 'dd-MM-yyyy h:mm a');
          class_endTime = this.datepipe.transform(element.onlineSchedule.classEndTime, 'dd-MM-yyyy h:mm a');
        }
        let downloadObj = {
          studentName: element.studentusers.firstName + ' ' + element.studentusers.lastName,
          email: element.studentusers.email,
          class: element.class.class_name + '-' + element.classSection.class_section.section_name,
          subject: element.subject.subject_name,
          attendanceDate: attendaneDate,
          class_startTime: class_startTime,
          class_endTime: class_endTime,
          startTime: start_Time,
          endTime: end_Time,
          duration: element.duration,
          attendanceStatus: element.attendanceStatus
        }
        this.downloadArr.push(downloadObj);
      });
      this.downloadStudentService.downloadFile(this.downloadArr, 'attendance');
    });

  }

}
