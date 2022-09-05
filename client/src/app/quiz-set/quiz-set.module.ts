import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizSetComponent } from './quiz-set.component';
import { QuizSetEditComponent } from './quiz-set-edit/quiz-set-edit.component';
import { QuizSetService } from './quiz-set.service';
import { QuizEditGuard } from './quiz-edit.guard';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuizQuestionComponent } from './quiz-set-edit/quiz-question.component';
import { QuizQuesAnsComponent } from './quiz-set-edit/quiz-ques-ans.component';
import { QuizHistoryComponent } from '../quiz-history/quiz-history.component';
import { UserQuizHistoryComponent } from '../quiz-history/user-quiz-history/user-quiz-history.component';
import { QuestionHistoryComponent } from '../quiz-history/question-history/question-history.component';
import { QuizSetSchoolComponent } from './quiz-set-school/quiz-set-school.component';
import { MathModule } from '../math/math.module';
// import { UserQuizQuesAnsComponent } from '../quiz-history/user-quiz-history/user-quiz-ques-ans.component'
import { from } from 'rxjs';
import { QuizAnsComponent } from './quiz-ans.component';
import { QuizsetPreviewComponent } from './quizset-preview/quizset-preview.component';
import { QuizQueDecodeComponent } from './quizset-preview/quiz-que-decode.component';

const routes = [
  { path: 'quizset', component: QuizSetComponent },
  {
    path: 'quizSetEdit/:id',
    canDeactivate: [QuizEditGuard],
    component: QuizSetEditComponent
  },
  {
    path: 'quizSetHistory/:id',
    canDeactivate: [QuizEditGuard],
    component: QuizHistoryComponent
  },
  {
    path: 'userQuizHistory/:id/:set_id',
    canDeactivate: [QuizEditGuard],
    component: UserQuizHistoryComponent
  },
  {
    path: 'userQuizHistory/:school_id/:class_id/:section_id/:student_id/:id/:set_id',
    canDeactivate: [QuizEditGuard],
    component: UserQuizHistoryComponent
  },
  {
    path: 'questionHistory/:set_id',
    canDeactivate: [QuizEditGuard],
    component: QuestionHistoryComponent
  },
  {
    path: 'quizSetSchool/:set_id',
    canDeactivate: [QuizEditGuard],
    component: QuizSetSchoolComponent
  },
  {
    path: 'quizSetPrevew',
    canDeactivate: [QuizEditGuard],
    component: QuizsetPreviewComponent
  }
];

@NgModule({
  declarations: [
    QuizSetComponent,
    QuizSetEditComponent,
    QuizQuestionComponent,
    QuizQuesAnsComponent,
    QuizSetSchoolComponent,
    QuizAnsComponent,
    QuizsetPreviewComponent,
    QuizQueDecodeComponent,
    // UserQuizQuesAnsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
    MathModule.forRoot()
  ],
  providers: [QuizSetService, QuizEditGuard]
})
export class QuizSetModule { }
