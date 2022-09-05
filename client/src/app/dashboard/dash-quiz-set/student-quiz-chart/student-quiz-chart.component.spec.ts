import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentQuizChartComponent } from './student-quiz-chart.component';

describe('StudentQuizChartComponent', () => {
  let component: StudentQuizChartComponent;
  let fixture: ComponentFixture<StudentQuizChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentQuizChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentQuizChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
