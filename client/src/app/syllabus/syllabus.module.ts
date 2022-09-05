import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LessonComponent } from './lesson/lesson.component';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { MathModule } from '../math/math.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddEditLessonComponent } from './lesson/add-edit-lesson/add-edit-lesson.component';
import { TopicComponent } from './topic/topic.component';
import { AddEditTopicComponent } from './topic/add-edit-topic/add-edit-topic.component';
import { SyllabusComponent } from './syllabus.component';


const routes = [

  { path: 'lesson', component: LessonComponent },
  { path: 'addeditlesson', component: AddEditLessonComponent },
  { path: 'addeditlesson/:lesson_id', component: AddEditLessonComponent },
  { path: 'topic', component: TopicComponent },
  { path: 'addedittopic', component: AddEditTopicComponent },
  { path: 'addedittopic/:topic_id', component: AddEditTopicComponent },

];


@NgModule({
  declarations: [
    LessonComponent,
    AddEditLessonComponent,
    TopicComponent,
    AddEditTopicComponent,
    SyllabusComponent
  ],
  imports: [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  RouterModule.forChild(routes),
  MathModule.forRoot(),
  HttpClientModule,
]
})
export class SyllabusModule { }
