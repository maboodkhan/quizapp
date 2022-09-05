import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizsetPreviewComponent } from './quizset-preview.component';

describe('QuizsetPreviewComponent', () => {
  let component: QuizsetPreviewComponent;
  let fixture: ComponentFixture<QuizsetPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizsetPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizsetPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
