import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionRemarksComponent } from './question-remarks.component';

describe('QuestionRemarksComponent', () => {
  let component: QuestionRemarksComponent;
  let fixture: ComponentFixture<QuestionRemarksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionRemarksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionRemarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
