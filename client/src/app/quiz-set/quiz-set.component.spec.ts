import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizSetComponent } from './quiz-set.component';

describe('QuizSetComponent', () => {
  let component: QuizSetComponent;
  let fixture: ComponentFixture<QuizSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
