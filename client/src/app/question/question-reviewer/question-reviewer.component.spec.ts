import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionReviewerComponent } from './question-reviewer.component';

describe('QuestionReviewerComponent', () => {
  let component: QuestionReviewerComponent;
  let fixture: ComponentFixture<QuestionReviewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionReviewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionReviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
