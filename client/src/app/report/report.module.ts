import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReportComponent } from './report.component';
import { PollReportComponent } from './poll-report/poll-report.component';
import { PollChartComponent } from './poll-chart/poll-chart.component';
import { ChartsModule } from 'ng2-charts';
import { PushNotificationComponent } from './push-notification/push-notification.component';
import { TeacherAttenReportComponent } from './teacher-atten-report/teacher-atten-report.component';
import { StudentListComponent } from './teacher-atten-report/student-list/student-list.component';
import { StudentAttenReportComponent } from './student-atten-report/student-atten-report.component';

const routes = [
  {
    path: 'notification-report',
    component: PushNotificationComponent
  },
  {
    path: 'pollReports',
    component: PollReportComponent
  },
  {
    path: 'pollReports/:schedule_id',
    component: PollReportComponent
  },
  {
    path: 'teacherAttendanceReport',
    component: TeacherAttenReportComponent
  },
  {
    path: 'studentAttendanceReport',
    component: StudentAttenReportComponent
  }
];


@NgModule({
  declarations: [
    ReportComponent,
    PollReportComponent,
    PollChartComponent,
    PushNotificationComponent,
    TeacherAttenReportComponent,
    StudentListComponent,
    StudentAttenReportComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    ChartsModule
  ],
  entryComponents: [StudentListComponent]
})
export class ReportModule { }
