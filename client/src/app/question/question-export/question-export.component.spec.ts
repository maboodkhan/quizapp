import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionExportComponent } from './question-export.component';

describe('QuestionExportComponent', () => {
  let component: QuestionExportComponent;
  let fixture: ComponentFixture<QuestionExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
