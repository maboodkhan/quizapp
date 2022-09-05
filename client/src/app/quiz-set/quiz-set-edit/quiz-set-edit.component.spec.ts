import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizSetEditComponent } from './quiz-set-edit.component';

describe('QuizSetEditComponent', () => {
  let component: QuizSetEditComponent;
  let fixture: ComponentFixture<QuizSetEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizSetEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizSetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
