import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostQuizDashboardComponent } from './post-quiz-dashboard.component';

describe('PostQuizDashboardComponent', () => {
  let component: PostQuizDashboardComponent;
  let fixture: ComponentFixture<PostQuizDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostQuizDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostQuizDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
