import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuizDashboardComponent } from './user-quiz-dashboard.component';

describe('UserQuizDashboardComponent', () => {
  let component: UserQuizDashboardComponent;
  let fixture: ComponentFixture<UserQuizDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuizDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuizDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
