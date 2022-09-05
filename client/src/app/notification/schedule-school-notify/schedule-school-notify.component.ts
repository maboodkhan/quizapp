import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { NotificationService } from '../notification.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from 'src/app/user/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-schedule-school-notify',
  templateUrl: './schedule-school-notify.component.html',
  styleUrls: ['./schedule-school-notify.component.css']
})

export class ScheduleSchoolNotifyComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageTitle = 'Schedule School Notifications';
  displayedColumns: string[] = ['Sno', 'notificationType', 'subNotificationType', 'scheduleDate', 'title', 'created_by', 'status', 'id'];

  customFilters: any = null;
  currentUser: any;
  dataSource: any;
  totalNotification: number;
  notificationData = [];
  userId: number;
  limit = 10;
  offset = 0;
  type_order: number;

  sectionList: any;
  schoolList: any;
  classList: any;
  schoolArr = [];
  classArr = [];
  sectionArr: [];
  searchFilter: any = {
    username: '',
    email: '',
    school_id: [],
    class_id: [],
    section_id: []
  };

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.userId = this.currentUser.id;
      this.type_order = this.currentUser.user_Type.type_order;
    }

    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        // console.log(this.customFilters);
        this.searchFilter = this.customFilters;
        this.sectionArr = this.customFilters.section_id
        if (this.customFilters.class_id != '') {
          this.changeClass(this.customFilters.class_id);
        }
      } else {
        this.customFilters = {};
      }
    })

    if (this.type_order == 1) {
      this.userService.getActiveSchools(this.userId).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.getUserClasses();
        this.getNotifications();
      });
    } else {
      let obj = { user_id: this.userId }
      // console.log(obj);
      this.userService.userSchools(obj).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.classArr = data.userClass;
        this.sectionArr = data.userSection;
        this.getUserClasses();
        this.getNotifications();
      });
    }
  }

  getNotifications() {
    this.customFilters = {
      created_by: this.userId,
      school_id: this.customFilters.school_id,
      class_id: this.customFilters.class_id,
      section_id: this.customFilters.section_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize,
      scheduleSchool: 1
    }
    console.log(this.customFilters);
    this.notificationService.getnotifications(this.customFilters).subscribe((notificationList: any) => {
      // console.log(notificationList);
      this.totalNotification = notificationList.total;
      this.notificationData = notificationList.data;
      this.dataSource = new MatTableDataSource(this.notificationData);
    })
  }

  getUserClasses(){
    let classObj = {
      board_id: 1,
      class_id: this.classArr
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });
  }

  searchUserData(filters: any) {
      this.customFilters = filters;
      this.getNotifications();
  }

  resetSearchFilter(searchPanel: any) {
    searchPanel.toggle();
    this.searchFilter = {};
    this.sectionArr = null;
    this.customFilters = {
      school_id: this.schoolArr,
      class_id: this.classArr,
      section_id: this.sectionArr
    }
    this.getNotifications();
  }

  reset() {
    this.getNotifications();
  }

  changeClass(class_id) {
    // this.sectionIdArr = [class_id];
    let classObj = { class_id: class_id, section_id: this.sectionArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
    })
  }

  // deleteData(notification_id){
  //   console.log(notification_id);
  // }

  deleteData(notification_id) {
    var result = confirm("Are you sure, you want to delete the notification schedule?");
    if (result) {
      let obj = { notification_id: notification_id }
      this.notificationService.deleteNotification(obj).subscribe((result: any) => {
        if (result.status) {
          this.getNotifications();
        }
      })
    }
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getNotifications();
        })
      ).subscribe();
  }

}
