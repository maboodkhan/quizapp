import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionUploadComponent } from './question-upload.component';

describe('QuestionUploadComponent', () => {
  let component: QuestionUploadComponent;
  let fixture: ComponentFixture<QuestionUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
