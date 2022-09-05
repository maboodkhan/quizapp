import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionIssuesComponent } from './question-issues.component';

describe('QuestionIssuesComponent', () => {
  let component: QuestionIssuesComponent;
  let fixture: ComponentFixture<QuestionIssuesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionIssuesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
