import { Component, OnInit, ViewChild } from '@angular/core';
import { OnlineScheduleService } from './online-schedule.service';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from '../user/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OnlineScheduleLessonComponent } from './online-schedule-lesson/online-schedule-lesson.component';

@Component({
  selector: 'app-online-schedule',
  templateUrl: './online-schedule.component.html',
  styleUrls: ['./online-schedule.component.css']
})
export class OnlineScheduleComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageTitle = 'School Management';
  displayedColumns: string[] = ['Sno', 'class', 'subject', 'lesson',
    'classLevel', 'startDate', 'endDate', 'classStatus', 'modified_by',
    'scheduletTo', 'status', 'copy', 'report', 'attendance', 'id'];
  currentUser: any;
  customFilters: any = null;
  dataSource: any;
  total_schedule: number;
  schoolList: any;
  classList: any;
  sectionList: any;
  subjectList: any;
  scheduleData = [];
  user_id: number;
  type_order: number;
  userList: any;
  schoolArr = [];
  classArr = [];
  sectionArr = [];
  created_by = [];
  teacherSchool = [];
  teacherClass = [];
  teacherSecton = [];
  limit = 10;
  offset = 0;

  searchFilter: any = {
    start_date: '',
    end_date: '',
    school_id: [],
    class_id: [],
    section_id: [],
    subject_id: [],
    schedule_to: [],
    status: 0,
    limit: 10,
    offset: 0
  };
  constructor(
    private onlineScheduleService: OnlineScheduleService,
    private userService: UserService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;

    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        // console.log(this.customFilters);
        this.searchFilter = this.customFilters;
        this.sectionArr = this.customFilters.section_id
        if (this.customFilters.class_id != '') {
          this.changeClass(this.customFilters.class_id);
          // console.log("kuch na kuch to aayega yaha p")
          // this.getTeacher();
        }
        if (this.customFilters.class_id != undefined || this.customFilters.school_id != undefined) {
          this.getTeacher();
        }
        // this.getTeacher();
        this.offset = this.paginator.pageIndex = (this.customFilters.offset / this.customFilters.limit);
        this.limit = this.paginator.pageSize = this.customFilters.limit;
      } else {
        this.customFilters = {};
      }
    })
    if (this.type_order == 1 || this.type_order == 2) {
      this.userService.getActiveSchools(this.user_id).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.getUserClasses();
        this.getSchedule();
      });
    } else {
      let obj = { user_id: this.user_id }
      // console.log(obj);
      this.onlineScheduleService.getUnderUser(obj).subscribe(createdIds => {
        // console.log(createdIds);
        this.created_by = createdIds;
        this.userService.userSchools(obj).subscribe((data: any) => {
          this.schoolList = data.data;
          this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
          this.classArr = data.userClass;
          this.sectionArr = data.userSection;
          if (this.schoolList.length == 1) {
            this.teacherSchool = [this.schoolList[0].id]
            this.teacherClass = this.classArr
            this.teacherSecton = this.sectionArr
            this.getTeacher();
          }
          // console.log(this.schoolArr);
          this.getUserClasses();
          // if(params)
          // console.log(this.customFilters);
          if (Object.keys(this.customFilters).length === 0) {
            this.customFilters = {
              school_id: this.schoolArr,
              class_id: this.classArr,
              section_id: this.sectionArr,
              schedule_to: null,
              created_by: this.created_by,
              limit: this.paginator.pageSize,
              offset: this.paginator.pageIndex * this.paginator.pageSize
            }
          }
          this.getSchedule();
        });
      });
    }
    // let classObj = {
    //   board_id: 1
    // }
    // this.userService.getClasses(classObj).subscribe((data: any) => {
    //   this.classList = data.data;
    // });
  }

  getSchedule() {
    this.customFilters = {
      start_date: this.customFilters.start_date,
      end_date: this.customFilters.end_date,
      school_id: this.customFilters.school_id,
      class_id: this.customFilters.class_id,
      section_id: this.customFilters.section_id,
      subject_id: this.customFilters.subject_id,
      schedule_to: this.customFilters.schedule_to,
      created_by: this.customFilters.created_by,
      status: this.customFilters.status,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    // console.log(this.customFilters);
    this.onlineScheduleService.getSchedule(this.customFilters).subscribe((scheduleList: any) => {
      // console.log(scheduleList);
      this.scheduleData = [];
      scheduleList.data.forEach(sl => {
        let date = new Date(sl.end_date);
        let hours = date.getHours();
        sl.ampm = hours >= 12 ? 'PM' : 'AM';
        this.scheduleData.push(sl);
      })
      this.dataSource = new MatTableDataSource(this.scheduleData);
      this.total_schedule = scheduleList.totalSchedule;
      // this.dataSource.paginator = this.paginator;
      // this.dataSource.sort = this.sort;
    })
  }

  deleteSchedule(scheduleId) {
    var result = confirm("Are you sure, you want to delete the schedule?");
    if (result) {
      let obj = { schedule_id: scheduleId }
      this.onlineScheduleService.deleteSchedule(obj).subscribe((result: any) => {
        if (result.status) {
          this.getSchedule();
        }
      })
    }
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

  reset() {
    this.getSchedule();
  }

  searchUserData(filters: any) {
    this.resetPageIndex();
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
      this.getSchedule();
    }
  }

  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.sectionArr = null;
    this.userList = null;
    this.customFilters = {
      school_id: this.schoolArr,
      class_id: this.classArr,
      section_id: this.sectionArr,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    if (this.schoolList.length == 1) {
      this.teacherSchool = [this.schoolList[0].id]
      this.teacherClass = this.classArr
      this.teacherSecton = this.sectionArr
    } else {
      this.teacherSchool = []
      this.teacherClass = []
      this.teacherSecton = []
    }
    this.getTeacher();
    this.getSchedule();
  }

  resetPageIndex() {
    this.paginator.pageIndex = 0;
  }

  changeSchool(school_id) {
    this.teacherSchool = school_id;
    this.getTeacher();
  }

  changeClass(class_id) {
    // this.sectionIdArr = [class_id];
    let classObj = { class_id: class_id, section_id: this.sectionArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
    })

    this.userService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
    this.teacherClass = class_id;
    this.getTeacher();
  }

  changeSection(section_id) {
    this.teacherSecton = section_id;
    this.getTeacher();
  }

  getTeacher() {
    let Obj = {
      school_id: this.teacherSchool,
      class_id: this.teacherClass,
      section_id: this.teacherSecton
    }
    this.onlineScheduleService.getScheduleTeacher(Obj).subscribe((result: any) => {
      let tempArr;
      // tempArr = result.data;
      let userArr = result.data;
      let mymap = new Map();
      tempArr = userArr.filter(el => {
        const val = mymap.get(el.user_id);
        if (val) {
          if (el.id < val) {
            mymap.delete(el.user_id);
            mymap.set(el.user_id, el.id);
            return true;
          } else { return false; }
        }
        mymap.set(el.user_id, el.id);
        return true;
      });
      this.userList = tempArr;
    });
  }

  editSchedule(scheduleId) {
    let scheduleObj = { schedule_id: scheduleId }
    this.onlineScheduleService.checkZoomMeeting(scheduleObj).subscribe((result: any) => {
      if (result.status) {
        this.reset();
        this.openSnackBar("Schedule is started. ", "Close");
      } else {
        this.router.navigate(['/editSchedule', scheduleId], {
          queryParams: { customFilters: JSON.stringify(this.customFilters) }
        });
      }
    })
  }

  addAutoFill(schedule_id) {
    this.router.navigateByUrl('/addSchedule', { state: { autoFill_id: schedule_id } });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  // lessonSchedule(schedule_id){
  //   console.log(schedule_id);
  // }

  lessonSchedule(schedule_id) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      schedule_id: schedule_id,
    };
    this.dialog.open(OnlineScheduleLessonComponent, dialogConfig);
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getSchedule();
        })
      ).subscribe();
  }

}
