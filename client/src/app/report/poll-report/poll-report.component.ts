import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
// import { QuestionService } from '../question.service';
import { UserService } from 'src/app/user/user.service';
import { OnlineScheduleService } from 'src/app/online-schedule/online-schedule.service';
import { QuestionService } from 'src/app/question/question.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-poll-report',
  templateUrl: './poll-report.component.html',
  styleUrls: ['./poll-report.component.css']
})


export class PollReportComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  currentUser: any;
  type_order: number;
  questionList: any;
  user_id: number;
  schoolList = [];
  classList: any;
  sectionList: any;
  userList: any;
  userSchoolArr = [];
  userClassArr = [];
  userSectonArr = [];
  schoolArr = [];
  classArr = [];
  sectionArr = [];
  teacherArr = [];
  teacherSchool = [];
  teacherClass = [];
  teacherSecton = [];
  startDate: string = '';
  endDate: string = '';
  limit = 6;
  offset = 0;
  rowHeight = '480px';
  schedule_id: number;

  searchFilter: any = {
    start_date: '',
    end_date: '',
    school_id: [],
    class_id: [],
    section_id: [],
    teacherUserId: null,
    limit: 10,
    offset: 0
  };

  constructor(private questionService: QuestionService,
    private onlineScheduleService: OnlineScheduleService,
    private route: ActivatedRoute,
    private userService: UserService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;

    this.route.params.subscribe(params => {
      this.schedule_id = +params['schedule_id'];
    });

    if (this.type_order == 1 || this.type_order == 2) {
      this.userService.getActiveSchools(this.user_id).subscribe((data: any) => {
        this.schoolList = data.data;
        this.getUserClasses();
        this.getQuestions();
      });
    } else {
      let obj = { user_id: this.user_id }
      // console.log(obj);
      this.userService.userSchools(obj).subscribe((data: any) => {
        // console.log(data);
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.userSchoolArr.push(element.id) });
        this.userClassArr = data.userClass;
        this.userSectonArr = data.userSection;
        this.schoolArr = this.userSchoolArr;
        this.classArr = this.userClassArr;
        this.sectionArr = this.userSectonArr;
        if (this.schoolList.length == 1) {
          this.teacherSchool = [this.schoolList[0].id];
          this.teacherClass = this.userClassArr;
          this.teacherSecton = this.userSectonArr;
          this.getTeacher();
        }
        // console.log(this.schoolArr);
        this.getUserClasses();
        this.getQuestions();
      });
    }

  }

  getQuestions() {
    let obj = {}
    this.questionService.getPollQuestions(obj).subscribe((result: any) => {
      this.questionList = result.data;
    });
  }


  getUserClasses() {
    let classObj = {
      board_id: 1,
      class_id: this.userClassArr
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });
  }


  changeClass(class_id, defaultVal = 0) {
    // this.sectionIdArr = class_id;
    let classObj = { class_id: class_id, section_id: this.userSectonArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
    });
    this.teacherClass = class_id;
    this.getTeacher();
  }

  resetPage() {
    this.getQuestions();
  }

  searchUserData(filters: any) {
    if (filters.start_date) {
      this.startDate = filters.start_date;
    }
    if (filters.end_date) {
      this.endDate = filters.end_date;
    }
    if (filters.school_id.length>0) {
      this.schoolArr = filters.school_id;
    }
    if (filters.class_id.length>0) {
      this.classArr = filters.class_id;
    }
    if (filters.section_id.length>0) {
      this.sectionArr = filters.section_id;
    }
    if (filters.teacherUserId) {
      this.teacherArr = filters.teacherUserId;
    }
    // console.log(this.schoolArr, this.classArr, this.sectionArr);
    this.getQuestions();
  }

  changeSchool(school_id) {
    this.teacherSchool = school_id;
    this.getTeacher();
  }


  resetSearchFilter(searchPanel: any) {
    searchPanel.toggle();
    this.startDate = '';
    this.endDate = '';
    this.schoolArr = this.userSchoolArr;
    this.classArr = this.userClassArr;
    this.sectionArr = this.userSectonArr;
    this.teacherArr = [];
    this.searchFilter = {};
    if (this.schoolList.length == 1) {
      this.teacherSchool = [this.schoolList[0].id]
      this.teacherClass = this.userClassArr
      this.teacherSecton = this.userSectonArr
    } else {
      this.teacherSchool = []
      this.teacherClass = []
      this.teacherSecton = []
    }
    this.getTeacher();
    this.getQuestions();
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
    // console.log(Obj);
    this.onlineScheduleService.getScheduleTeacher(Obj).subscribe((result: any) => {
      // console.log(result);
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


  ngAfterViewInit() {

    merge(this.paginator.page)
      .pipe(
        tap(() => {
          this.offset = this.paginator.pageIndex * this.paginator.pageSize;
          this.limit = this.paginator.pageSize;
          this.ngOnInit();
        })
      )
      .subscribe();
  }

}
