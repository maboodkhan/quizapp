import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http, HttpModule, BrowserXhr } from '@angular/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';

import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';

import { NgModule, ApplicationRef } from '@angular/core';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import { RouterModule, PreloadAllModules } from '@angular/router';

/*
 * Platform and Environment providers/directives/pipes
 */
// import { ENV_PROVIDERS } from '../environments/environment';
import { ROUTES } from './app.routes';

// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';

import { AboutComponent } from './about';
import { NotFoundPageComponent } from './notfoundpage';
import { LoginComponent } from './login';

import { RootComponent } from './root';
import { ConfirmDialog } from './shared';

import { ChartsModule } from 'ng2-charts';
import { RootModule } from './root';

// Providers
import { AppPreloader } from './app.preloader';
import { AuthGuard } from './_guard';
import {
  BackendService,
  AuthenticationService
} from './_services';

import '../styles/headings.css';
import '../styles/styles.scss';

import { MaterialModule } from './shared';
import { UserModule } from './user/user.module';
import { QuizSetModule } from './quiz-set/quiz-set.module';
import { QuestionModule } from './question/question.module';
import { QuizHistoryComponent } from './quiz-history/quiz-history.component';
import { UserQuizHistoryComponent } from './quiz-history/user-quiz-history/user-quiz-history.component';
import { UserQuizQuesComponent } from './quiz-history/user-quiz-history/user-quiz-ques.component';
import { UserQuizQuesAnsComponent } from './quiz-history/user-quiz-history/user-quiz-ques-ans.component';
import { QuestionHistoryComponent } from './quiz-history/question-history/question-history.component';
import { QuestionDataComponent } from './quiz-history/question-history/question-data/question-data.component';
import { QuesDataComponent } from './quiz-history/question-history/ques-data.component';
import { QuesChartDataComponent } from './quiz-history/question-history/ques-chart-data.component';
import { MathModule } from './math/math.module';
import { UserQuizAnsAttemptedComponent } from './quiz-history/user-quiz-history/user-quiz-ans-attempted.component';
import { from } from 'rxjs';
import { SchoolModule } from './school/school.module';
import { UserTypeModule } from './user-type/user-type.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OnlineScheduleModule } from './online-schedule/online-schedule.module';
import { NotificationModule } from './notification/notification.module';
import { ReportModule } from './report/report.module';
import { AutologinComponent } from './login/autologin.component';
import { ContentModule } from './content/content.module';
import { AppContentModule } from './app-content/app-content.module';
import { SyllabusModule } from './syllabus/syllabus.module';
import { AclModule } from './acl/acl.module';
// import { HomeworkComponent } from './homework/homework.component';
// import { QuestionAssignComponent } fro./question/question-assign/question-assign.componentent';
// import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';


// Application wide providers
const APP_PROVIDERS = [...APP_RESOLVER_PROVIDERS, AppState];

type StoreType = {
  state: InternalStateType;
  restoreInputValues: () => void;
  disposeOldHosts: () => void;
};

/**
 * `AppModule` is the main entry point into Angular's bootstraping process
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    AboutComponent,
    NotFoundPageComponent,
    LoginComponent,
    RootComponent,
    ConfirmDialog,
    QuizHistoryComponent,
    UserQuizHistoryComponent,
    UserQuizQuesComponent,
    UserQuizQuesAnsComponent,
    QuestionHistoryComponent,
    QuestionDataComponent,
    QuesDataComponent,
    QuesChartDataComponent,
    UserQuizAnsAttemptedComponent,
    AutologinComponent
    // HomeworkComponent
    // QuestionAssignComponent
  ],
  /**
   * Import Angular's modules.
   */
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    ChartsModule,
    NgProgressModule.forRoot(),
    NgProgressHttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    UserModule,
    RootModule,
    QuizSetModule,
    QuestionModule,
    SchoolModule,
    UserTypeModule,
    DashboardModule,
    NotificationModule,
    OnlineScheduleModule,
    ReportModule,
    ContentModule,
    AppContentModule,
    SyllabusModule,
    MathModule.forRoot(),
    AclModule
    // OwlDateTimeModule, 
    // OwlNativeDateTimeModule
  ],
  entryComponents: [ConfirmDialog],
  /**
   * Expose our Services and Providers into Angular's dependency injection.
   */
  providers: [
    AuthGuard,
    AppPreloader,
    BackendService,
    AuthenticationService,
    // { provide: BrowserXhr, useClass: NgProgressBrowserXhr } ,    
    APP_PROVIDERS
  ],
  exports: [MaterialModule, UserQuizAnsAttemptedComponent]
})
export class AppModule {
  constructor(
    public appRef: ApplicationRef,
    public appState: AppState // private progress: NgProgressService
  ) { }

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    // console.log('HMR store', JSON.stringify(store, null, 2));
    /**
     * Set state
     */
    this.appState._state = store.state;
    /**
     * Set input values
     */
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(
      cmp => cmp.location.nativeElement
    );
    /**
     * Save state
     */
    const state = this.appState._state;
    store.state = state;
    /**
     * Recreate root elements
     */
    store.disposeOldHosts = createNewHosts(cmpLocation);
    /**
     * Save input values
     */
    store.restoreInputValues = createInputTransfer();
    /**
     * Remove styles
     */
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    /**
     * Display new elements
     */
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

  // ngAfterContentInit(){

  //  this.progress.start();
  //  setTimeout(()=>{
  //    this.progress.done();
  //  }, 2000);
  // }
}
