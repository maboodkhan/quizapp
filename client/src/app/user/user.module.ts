import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from './user.service';

import { RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserEditGuard } from './user-guard.service';
import { UserImportComponent } from './user-import/user-import.component';
import { UserDataComponent } from './user-data/user-data.component';
import { UserDataAddEditComponent } from './user-data-add-edit/user-data-add-edit.component';
import { ClassSectionComponent } from './class-section/class-section.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { AttendanceDetailComponent } from './attendance/attendance-detail/attendance-detail.component';
import { StudentAttendanceComponent } from './attendance/student-attendance/student-attendance.component';
import { StuAttendenceDetailComponent } from './attendance/stu-attendence-detail/stu-attendence-detail.component';
import { TeacherAttendanceComponent } from './attendance/teacher-attendance/teacher-attendance.component';
import { UserClassNotifyComponent } from './user-class-notify/user-class-notify.component';
import { UserNotificationComponent } from './user-notification/user-notification.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { AppUserDetailsComponent } from './app-user-details/app-user-details.component';
import { AppUserComponent } from './app-user/app-user.component';
import { AppUserMoreDetailComponent } from './app-user/app-user-more-detail/app-user-more-detail.component';
// import { AttendanceDetailComponent } from './attendance-detail/attendance-detail.component';
// import { StudentAttendanceComponent } from './student-attendance/student-attendance.component';
// import { StuAttendenceDetailComponent } from './stu-attendence-detail/stu-attendence-detail.component';
// import { TeacherAttendanceComponent } from './teacher-attendance/teacher-attendance.component';

@NgModule({
  declarations: [
    UserComponent,
    UserEditComponent,
    UserImportComponent,
    UserDataComponent,
    UserDataAddEditComponent,
    ClassSectionComponent,
    AttendanceComponent,
    AttendanceDetailComponent,
    StudentAttendanceComponent,
    StuAttendenceDetailComponent,
    TeacherAttendanceComponent,
    UserClassNotifyComponent,
    UserNotificationComponent,
    UserDetailsComponent,
    AppUserDetailsComponent,
    AppUserComponent,
    AppUserMoreDetailComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([
      { path: 'user', component: UserComponent },
      {
        path: 'userEdit/:id',
        canDeactivate: [UserEditGuard],
        component: UserEditComponent
      },
      {
        path: 'userData',
        component: UserDataComponent
      },
      {
        path: 'addUserData',
        component: UserDataAddEditComponent
      },
      {
        path: 'editUserData/:id',
        component: UserDataAddEditComponent
      },
      {
        path: 'teacherAttendance',
        component: TeacherAttendanceComponent
      },
      {
        path: 'teacherAttendance/:schedule_id',
        component: TeacherAttendanceComponent
      },
      {
        path: 'attendanceDetail/:id',
        component: AttendanceDetailComponent
      },
      {
        path: 'attendanceDetail/:id/:schedule_id',
        component: AttendanceDetailComponent
      },
      {
        path: 'studentAttendance',
        component: StudentAttendanceComponent
      },
      {
        path: 'studentAttendanceDetail/:id',
        component: StuAttendenceDetailComponent
      },
      {
        path: 'userClassNotification',
        component: UserClassNotifyComponent
      },
      {
        path: 'userDetail',
        component: UserDetailsComponent
      },
      {
        path: 'appUserDetail',
        component: AppUserDetailsComponent
      },
      {
        path: 'appUser',
        component: AppUserComponent
      },
      {
        path: 'appUserMoreDetail/:id',
        component: AppUserMoreDetailComponent
      },
    ])
  ],
  entryComponents: [UserImportComponent, ClassSectionComponent],
  providers: [UserService,UserEditGuard]
})
export class UserModule { }
