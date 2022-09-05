import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizSetSchoolComponent } from './quiz-set-school.component';

describe('QuizSetSchoolComponent', () => {
  let component: QuizSetSchoolComponent;
  let fixture: ComponentFixture<QuizSetSchoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizSetSchoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizSetSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
