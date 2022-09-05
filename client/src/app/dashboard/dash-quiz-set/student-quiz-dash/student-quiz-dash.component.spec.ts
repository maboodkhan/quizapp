import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentQuizDashComponent } from './student-quiz-dash.component';

describe('StudentQuizDashComponent', () => {
  let component: StudentQuizDashComponent;
  let fixture: ComponentFixture<StudentQuizDashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentQuizDashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentQuizDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
