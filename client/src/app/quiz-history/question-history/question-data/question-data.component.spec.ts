import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionDataComponent } from './question-data.component';

describe('QuestionDataComponent', () => {
  let component: QuestionDataComponent;
  let fixture: ComponentFixture<QuestionDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
