import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionLogsComponent } from './question-logs.component';

describe('QuestionLogsComponent', () => {
  let component: QuestionLogsComponent;
  let fixture: ComponentFixture<QuestionLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
