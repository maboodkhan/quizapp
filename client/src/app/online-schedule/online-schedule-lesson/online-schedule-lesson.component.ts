import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { OnlineScheduleService } from '../online-schedule.service';

@Component({
  selector: 'app-online-schedule-lesson',
  templateUrl: './online-schedule-lesson.component.html',
  styleUrls: ['./online-schedule-lesson.component.css']
})
export class OnlineScheduleLessonComponent implements OnInit {

  schedule_id: any;
  scheduleLesson: any;

  constructor( private onlineScheduleService: OnlineScheduleService,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.schedule_id = data;
    }

  ngOnInit() {
    this.onlineScheduleService.getScheduleLesson(this.schedule_id).subscribe((data: any)=> {
      // console.log(data);
      this.scheduleLesson = data.data;
    })
  }

}
