import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { NotificationService } from '../notification.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-schedule-notification',
  templateUrl: './schedule-notification.component.html',
  styleUrls: ['./schedule-notification.component.css']
})
export class ScheduleNotificationComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageTitle = 'Schedule Notifications';
  displayedColumns: string[] = ['Sno', 'notificationType', 'subNotificationType', 'scheduleDate', 'title', 'created_by', 'status', 'id'];

  customFilters: any = null;
  currentUser: any;
  dataSource: any;
  totalNotification: number;
  notificationData = [];
  limit = 10;
  offset = 0;
  userId: number;

  constructor(
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.userId = this.currentUser.id;
    }
    this.getNotifications();
  }

  getNotifications() {
    this.customFilters = {
      created_by: this.userId,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    this.notificationService.getnotifications(this.customFilters).subscribe((notificationList: any) => {
      console.log(notificationList);
      this.totalNotification = notificationList.total;
      this.notificationData = notificationList.data;
      this.dataSource = new MatTableDataSource(this.notificationData);
    })
  }

  reset(){
    this.getNotifications();
  }

  // deleteData(notification_id){
  //   console.log(notification_id);
  // }

  deleteData(notification_id, status) {
    var result = confirm("Are you sure, you want to delete the notification schedule?");
    if (result) {
      let obj = { notification_id: notification_id, status: status }
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
