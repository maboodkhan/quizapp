import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionComponent } from './question.component';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuestionDecodeComponent } from './question-decode.component';
import { QuesAddEditComponent } from './ques-add-edit/ques-add-edit.component';
import { MathModule } from '../math/math.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { QuestionUploadComponent } from './question-upload/question-upload.component';
import { QuestionImportComponent } from './question-import/question-import.component';
import { HttpClientModule } from '@angular/common/http';
import { QuestionAssignComponent } from './question-assign/question-assign.component';
import { QuetionPreviewComponent } from './quetion-preview/quetion-preview.component';
import { QueDecodeComponent } from './quetion-preview/que-decode.component';
import { QuesAnsComponent } from './quetion-preview/ques-ans.component';
import { RightAnsComponent } from './quetion-preview/right-ans.component';
import { LessonAssignComponent } from './lesson-assign/lesson-assign.component';
import { UserLessonsComponent } from './user-lessons/user-lessons.component';
import { QuestionIssuesComponent } from './question-issues/question-issues.component';
import { DecodeQuestionComponent } from './question-issues/decode-question.component';
import { QueIsseueEditComponent } from './que-isseue-edit/que-isseue-edit.component';
import { AssignMessageComponent } from './lesson-assign/assign-message.component';
import { QuesUserAssignComponent } from './ques-user-assign/ques-user-assign.component';
import { QuesSolComponent } from './quetion-preview/ques-sol.component';
import { PermissionAssignComponent } from './permission-assign/permission-assign.component';
import { BothPreviewComponent } from './both-preview/both-preview.component';
import { OldPreviewComponent } from './old-preview/old-preview.component';
import { OldqueDecodeComponent } from './old-preview/oldque-decode.component';
import { QuestionRemarksComponent } from './question-remarks/question-remarks.component';
import { QueAddRemarksComponent } from './que-add-remarks/que-add-remarks.component';
import { BothAssignComponent } from './both-assign/both-assign.component';
import { QuestionReviewerComponent } from './question-reviewer/question-reviewer.component';
import { ViewIssueComponent } from './view-issue/view-issue.component';
import { QuestionLogsComponent } from './question-logs/question-logs.component';
import { PollQueAnsComponent } from './poll-que-ans/poll-que-ans.component';
import { PollReportComponent } from './poll-report/poll-report.component';
import { PollChartComponent } from './poll-chart/poll-chart.component';
import { ChartsModule } from 'ng2-charts';
import { MoveQuestionComponent } from './move-question/move-question.component';
import { QuestionExportComponent } from './question-export/question-export.component';

const routes = [
  { path: 'question', component: QuestionComponent },
  {
    path: 'questionEdit/:id',
    component: QuesAddEditComponent
  },
  {
    path: 'questionAdd',
    component: QuesAddEditComponent
  },
  {
    path: 'questionUpload',
    component: QuestionUploadComponent
  },
  { 
    path: 'questionAssign', 
    component: QuesUserAssignComponent },
  {
    path: 'lessonAssign',
    component: LessonAssignComponent
  },
  {
    path: 'userLesson',
    component: UserLessonsComponent
  },
  {
    path: 'questionIssues',
    component: QuestionIssuesComponent
  },
  {
    path: 'quesIssuesEdit/:issue_id',
    component: QueIsseueEditComponent
  },
  {
    path: 'viewIssue/:question_id',
    component: ViewIssueComponent
  },
  {
    path: 'pollQuestions',
    component: PollQueAnsComponent
  },
  {
    path: 'pollReport',
    component: PollReportComponent
  },
  {
    path: 'questionExport',
    component: QuestionExportComponent
  }
];


@NgModule({
  declarations: [
    QuestionComponent,
    QuestionDecodeComponent,
    QuesAddEditComponent,
    QuestionUploadComponent,
    QuestionImportComponent,
    QuestionAssignComponent,
    QuetionPreviewComponent,
    QueDecodeComponent,
    QuesAnsComponent,
    RightAnsComponent,
    LessonAssignComponent,
    UserLessonsComponent,
    QuestionIssuesComponent,
    DecodeQuestionComponent,
    QueIsseueEditComponent,
    AssignMessageComponent,
    QuesUserAssignComponent,
    QuesSolComponent,
    PermissionAssignComponent,
    BothPreviewComponent,
    OldPreviewComponent,
    OldqueDecodeComponent,
    QuestionRemarksComponent,
    QueAddRemarksComponent,
    BothAssignComponent,
    QuestionReviewerComponent,
    ViewIssueComponent,
    QuestionLogsComponent,
    PollQueAnsComponent,
    PollReportComponent,
    PollChartComponent,
    MoveQuestionComponent,
    QuestionExportComponent
  ],
  imports: [
    CommonModule,
    CKEditorModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
    MathModule.forRoot(),
    HttpClientModule,
    ChartsModule
  ],
  entryComponents: [QuestionImportComponent, 
    QuestionAssignComponent, 
    QuetionPreviewComponent, 
    AssignMessageComponent, 
    PermissionAssignComponent,
    BothPreviewComponent,
    OldPreviewComponent,
    QuestionRemarksComponent,
    QueAddRemarksComponent,
    BothAssignComponent,
    QuestionLogsComponent,
    MoveQuestionComponent
  ]
})
export class QuestionModule { }
