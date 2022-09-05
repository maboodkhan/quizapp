import { AboutComponent } from '../about';
import { RootComponent } from './root.component';
// import { HomeComponent } from './home.component';
import { DashboardComponent } from '../dashboard';
import { AuthGuard } from '../_guard';
import { NotFoundPageComponent } from '../notfoundpage';
import { UserComponent } from '../user/user.component';
import { QuizSetComponent } from '../quiz-set/quiz-set.component';
import { QuestionComponent } from '../question/question.component';

export const routes = [
  {
    path: '',

    children: [
      {
        path: '',
        redicrectTo: '/dashboard',
        component: DashboardComponent,
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'quizset',
        component: QuizSetComponent
      },
      {
        path: 'question',
        component: QuestionComponent
      }
    ]
  }
];
