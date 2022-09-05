import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog, MatPaginator, MatSort, MatTableDataSource, MatOption, MatSnackBar } from '@angular/material';
// import { UserService } from './user.service';
// import { FormsModule } from '@angular/forms';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
// import { UserService } from '../../user.service';
// import { DownloadAttendanceService } from '../download-attendance.service';
// import { DatePipe } from '@angular/common';
import { OnlineScheduleService } from 'src/app/online-schedule/online-schedule.service';
import { UserService } from 'src/app/user/user.service';
import { ReportService } from '../report.service';
import { DatePipe } from '@angular/common';
import { DownloadTeacherService } from '../download-teacher.service';
import { StudentListComponent } from './student-list/student-list.component';

@Component({
  selector: 'app-teacher-atten-report',
  templateUrl: './teacher-atten-report.component.html',
  styleUrls: ['./teacher-atten-report.component.css'],
  providers: [DatePipe]
})

export class TeacherAttenReportComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;
  dataSource: any;
  displayedColumns: string[] = ['S_No', 'name', 'email', 'class', 'subject', 'attendanceDate', 'scheduleStart', 'scheduleEnd', 'startTime', 'endTime', 'disconnect', 'students'];
  pageTitle = 'Teacher Attendance Report';
  limit = 10;
  offset = 0;
  total_teacher: number;
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
  schoolArr = [];
  classArr = [];
  sectionArr = [];

  searchFilter: any = {
    teacherName: '',
    from_date: '',
    to_date: '',
    school_id: [],
    class_id: [],
    section_id: [],
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
    public datepipe: DatePipe,
    private downloadTeacher: DownloadTeacherService
    // private downloadService: DownloadAttendanceService
    ) { }

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
      teacherName: this.customFilters.teacherName,
      status: this.customFilters.status,
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
    this.reportService.teacherAttendanceReport(this.customFilters).subscribe((result: any) => {
      // console.log(result);
      this.total_teacher = result.totalCount;
      result.data.forEach(e1 => {
        let noOfDisconnect = 0;
        e1.noOfDisconnect = e1.zoomClass.length - 1;
        if(e1.zoomClass.length == 1){
          e1.startTime = e1.start_date
          e1.endTime = e1.zoomClass[0].created_on;
        }else if(e1.zoomClass.length > 1){
          e1.startTime = e1.start_date
          e1.endTime = e1.zoomClass[e1.zoomClass.length-1].created_on;
        }else{
          e1.startTime = 0;
          e1.endTime = 0;
          e1.noOfDisconnect = 0;
        }
        this.userData.push(e1);
      });
      // console.log(this.userData);
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


  changeClass(class_id, defaultVal = 0) {
    // this.sectionIdArr = class_id;
    let classObj = { class_id: class_id, section_id: this.sectionArr }
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
    this.reportService.teacherAttendanceReport(this.customFilters).subscribe((result: any) => {
      // console.log(result);
      this.total_teacher = result.totalCount;
      result.data.forEach(e1 => {
        let noOfDisconnect = 0;
        e1.noOfDisconnect = e1.zoomClass.length - 1;
        if(e1.zoomClass.length == 1){
          e1.endTime = e1.zoomClass[0].created_on;
        }else{
          e1.endTime = e1.zoomClass[e1.zoomClass.length-1].created_on;
        }
        this.userData.push(e1);
        let attendaneDate = this.datepipe.transform(e1.start_date, 'dd-MM-yyyy h:mm a');
        let startTime = this.datepipe.transform(e1.start_date, 'dd-MM-yyyy h:mm a');
        let endTime = this.datepipe.transform(e1.endTime, 'dd-MM-yyyy h:mm a');
        let downloadObj = {
          teacherName: e1.quizUser.firstName + ' ' + e1.quizUser.lastName,
          email: e1.quizUser.email,
          class: e1.class.class_name + '-' + e1.classSection.class_section.section_name,
          subject: e1.subject.subject_name,
          attendanceDate: attendaneDate,
          startTime: startTime,
          endTime: endTime,
          disconnectCount: e1.noOfDisconnect
        }
        this.downloadArr.push(downloadObj);
      });
      this.downloadTeacher.downloadFile(this.downloadArr, 'attendance');
    });
    
  }

  studentList(attendance){
    const dialogConfig = new MatDialogConfig();
    // let questionIds = [question_id];
    // dialogConfig.width = '700px';
    // dialogConfig.height = '600px';
    dialogConfig.data = attendance
    const dialogRef = this.dialog.open(StudentListComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //this.getAllTopicQuestions(this.topicId);
        // let paramsVal = this.quesSelection;
        // this.selectedAll = true;
        // this.getAllQuestions(paramsVal);
        // this.openSnackBar("Questions for QC have been assigned successfully. ", "Close");
      }
    );
  }

}


    // this.route.queryParams.subscribe((params: any) => {
    //   if(params.cstmFltr){
    //     this.cstmFltr = JSON.parse(params.cstmFltr);
    //   }
    //   if (params.customFilters) {
    //     this.customFilters = JSON.parse(params.customFilters);
    //     this.searchFilter = this.customFilters;
    //     if (this.customFilters.class_id != '') {
    //       this.changeClass(this.customFilters.class_id, 1);
    //     }
    //     this.offset = this.paginator.pageIndex = (this.customFilters.offset / this.customFilters.limit);
    //     this.limit = this.paginator.pageSize = this.customFilters.limit;
    //   } else {
    //     this.customFilters = {
    //       takenBy: this.user_id,
    //       limit: this.paginator.pageSize,
    //       offset: this.paginator.pageIndex * this.paginator.pageSize
    //     }
    //   }
    // })