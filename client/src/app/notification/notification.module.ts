import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { UserClassNotifyComponent } from './user-class-notify/user-class-notify.component';
import { NotificationComponent } from './notification.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ScheduleNotificationComponent } from './schedule-notification/schedule-notification.component';
import { AddScheduleNotifiComponent } from './schedule-notification/add-schedule-notifi/add-schedule-notifi.component';
import { UserNotificationComponent } from './user-notification/user-notification.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ScheduleSchoolNotifyComponent } from './schedule-school-notify/schedule-school-notify.component';
import { AddSclScheduleNotiComponent } from './schedule-school-notify/add-scl-schedule-noti/add-scl-schedule-noti.component';


const routes = [
  {
    path: 'scheduleNotifications',
    component: ScheduleNotificationComponent
  },
  {
    path: 'scheduleSchoolNotify',
    component: ScheduleSchoolNotifyComponent
  },
  {
    path: 'userClassNotifications',
    component: UserClassNotifyComponent
  },
  {
    path: 'userNotification',
    component: UserNotificationComponent
  },
  {
    path: 'addScheduleNotify',
    component: AddScheduleNotifiComponent
  },
  {
    path: 'addSclScheduleNotify',
    component: AddSclScheduleNotiComponent
  },
  {
    path: 'editSclScheduleNotify/:notification_id',
    component: AddSclScheduleNotiComponent
  },
  {
    path: 'editScheduleNotify/:notification_id',
    component: AddScheduleNotifiComponent
  },
];


@NgModule({
  declarations: [
    UserClassNotifyComponent,
    UserNotificationComponent,
    AddScheduleNotifiComponent,
    NotificationComponent,
    ScheduleNotificationComponent,
    ScheduleSchoolNotifyComponent,
    AddSclScheduleNotiComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    CKEditorModule,
    RouterModule.forChild(routes)
  ],
})
export class NotificationModule { }
