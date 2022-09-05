import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnlineScheduleComponent } from './online-schedule.component';
import { AddEditScheduleComponent } from './add-edit-schedule/add-edit-schedule.component';
import { OnlineScheduleService } from './online-schedule.service';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { OnlineScheduleLessonComponent } from './online-schedule-lesson/online-schedule-lesson.component';




const routes = [
  {
    path: 'onlineSchedule',
    component: OnlineScheduleComponent
  },
  {
    path: 'addSchedule',
    component: AddEditScheduleComponent
  },
  {
    path: 'editSchedule/:schedule_id',
    component: AddEditScheduleComponent
  }
];

@NgModule({
  declarations: [
    OnlineScheduleComponent,
    AddEditScheduleComponent,
    OnlineScheduleLessonComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
  ],
  providers: [OnlineScheduleService],
  entryComponents: [OnlineScheduleLessonComponent]
})
export class OnlineScheduleModule { }
