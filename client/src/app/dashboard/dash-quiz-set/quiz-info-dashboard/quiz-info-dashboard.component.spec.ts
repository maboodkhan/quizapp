import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizInfoDashboardComponent } from './quiz-info-dashboard.component';

describe('QuizInfoDashboardComponent', () => {
  let component: QuizInfoDashboardComponent;
  let fixture: ComponentFixture<QuizInfoDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizInfoDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizInfoDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
