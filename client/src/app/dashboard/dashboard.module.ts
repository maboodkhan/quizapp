import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashQuizSetComponent } from './dash-quiz-set/dash-quiz-set.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { MathModule } from '../math/math.module';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService } from './dashboard.service';
import { DashboardComponent } from './dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { SchoolDashboardComponent } from './dash-quiz-set/school-dashboard/school-dashboard.component';
import { QuizChartComponent } from './dash-quiz-set/quiz-chart/quiz-chart.component';
import { ClassDashboardComponent } from './dash-quiz-set/class-dashboard/class-dashboard.component';
import { SectionDashboardComponent } from './dash-quiz-set/section-dashboard/section-dashboard.component';
import { QuizDashboardComponent } from './dash-quiz-set/quiz-dashboard/quiz-dashboard.component';
import { UserQuizDashboardComponent } from './dash-quiz-set/user-quiz-dashboard/user-quiz-dashboard.component';
import { UserDashboardComponent } from './dash-quiz-set/user-dashboard/user-dashboard.component';
import { StudentQuizChartComponent } from './dash-quiz-set/student-quiz-chart/student-quiz-chart.component';
import { StudentQuizDashComponent } from './dash-quiz-set/student-quiz-dash/student-quiz-dash.component';
import { TopicDashboardComponent } from './dash-quiz-set/topic-dashboard/topic-dashboard.component';
import { TopicChartComponent } from './dash-quiz-set/topic-chart/topic-chart.component';
import { QuizInfoDashboardComponent } from './dash-quiz-set/quiz-info-dashboard/quiz-info-dashboard.component';
import { UserListDashboardComponent } from './dash-quiz-set/user-list-dashboard/user-list-dashboard.component';
import { DashQuizsetPostTestComponent } from './dash-quizset-post-test/dash-quizset-post-test.component';
import { PostSchoolDashboardComponent } from './dash-quizset-post-test/post-school-dashboard/post-school-dashboard.component';
import { PostClassDashboardComponent } from './dash-quizset-post-test/post-class-dashboard/post-class-dashboard.component';
import { PostQuizChartComponent } from './dash-quizset-post-test/post-quiz-chart/post-quiz-chart.component';
import { PostDashboardService } from './post-dashboard.service';
import { PostSectionDashboardComponent } from './dash-quizset-post-test/post-section-dashboard/post-section-dashboard.component';
import { PostUserQuizDashComponent } from './dash-quizset-post-test/post-user-quiz-dash/post-user-quiz-dash.component';
import { PostUserListDashComponent } from './dash-quizset-post-test/post-user-list-dash/post-user-list-dash.component';
import { PostUserDashComponent } from './dash-quizset-post-test/post-user-dash/post-user-dash.component';
import { PostQuizDashboardComponent } from './dash-quizset-post-test/post-quiz-dashboard/post-quiz-dashboard.component';
import { PostQuizInfoDashComponent } from './dash-quizset-post-test/post-quiz-info-dash/post-quiz-info-dash.component';
import { PostStudentQuizDashComponent } from './dash-quizset-post-test/post-student-quiz-dash/post-student-quiz-dash.component';
import { PostTopicDashComponent } from './dash-quizset-post-test/post-topic-dash/post-topic-dash.component';
import { PostTopicChartComponent } from './dash-quizset-post-test/post-topic-chart/post-topic-chart.component';
import { PostStudentQuizChatComponent } from './dash-quizset-post-test/post-student-quiz-chat/post-student-quiz-chat.component';

const routes = [
  {
    path: 'dashQuizSet', component: DashQuizSetComponent,
  },
  // {
  //   path: 'school_dashboard',
  //   component: SchoolDashboardComponent
  // },
  {
    path: 'class_dashboard/:school_id',
    component: ClassDashboardComponent
  },
  {
    path: 'section_dashboard/:school_id/:class_id',
    component: SectionDashboardComponent
  },
  {
    path: 'quiz_dashboard/:school_id/:class_id/:section_id',
    component: UserQuizDashboardComponent
  },
  {
    path: 'topic_dashboard/:school_id/:class_id/:section_id/:quiz_id',
    component: TopicDashboardComponent
  },
  {
    path: 'student_quiz_dash/:school_id/:class_id/:section_id/:student_id',
    component: StudentQuizDashComponent
  },
  {
    path: 'post_class_dashboard/:school_id',
    component: PostClassDashboardComponent
  },
  {
    path: 'post_section_dashboard/:school_id/:class_id',
    component: PostSectionDashboardComponent
  },
  {
    path: 'post_quiz_dashboard/:school_id/:class_id/:section_id',
    component: PostUserQuizDashComponent
  },
  {
    path: 'post_student_quiz_dash/:school_id/:class_id/:section_id/:student_id',
    component: PostStudentQuizDashComponent
  },
  {
    path: 'post_topic_dashboard/:school_id/:class_id/:section_id/:quiz_id',
    component: PostTopicDashComponent
  },
];

@NgModule({
  declarations: [
    DashQuizSetComponent,
    DashboardComponent,
    SchoolDashboardComponent,
    QuizChartComponent,
    ClassDashboardComponent,
    SectionDashboardComponent,
    QuizDashboardComponent,
    UserQuizDashboardComponent,
    UserDashboardComponent,
    StudentQuizChartComponent,
    StudentQuizDashComponent,
    TopicDashboardComponent,
    TopicChartComponent,
    QuizInfoDashboardComponent,
    UserListDashboardComponent,
    DashQuizsetPostTestComponent,
    PostSchoolDashboardComponent,
    PostClassDashboardComponent,
    PostQuizChartComponent,
    PostSectionDashboardComponent,
    PostUserQuizDashComponent,
    PostUserListDashComponent,
    PostUserDashComponent,
    PostQuizDashboardComponent,
    PostQuizInfoDashComponent,
    PostStudentQuizDashComponent,
    PostTopicDashComponent,
    PostTopicChartComponent,
    PostStudentQuizChatComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
    MathModule.forRoot(),
    HttpClientModule
  ],
  entryComponents: [QuizInfoDashboardComponent, PostQuizInfoDashComponent],
  providers: [DashboardService, PostDashboardService]
})
export class DashboardModule { }
