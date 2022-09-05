import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostStudentQuizDashComponent } from './post-student-quiz-dash.component';

describe('PostStudentQuizDashComponent', () => {
  let component: PostStudentQuizDashComponent;
  let fixture: ComponentFixture<PostStudentQuizDashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostStudentQuizDashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostStudentQuizDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
