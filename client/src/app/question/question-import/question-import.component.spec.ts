import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionImportComponent } from './question-import.component';

describe('QuestionImportComponent', () => {
  let component: QuestionImportComponent;
  let fixture: ComponentFixture<QuestionImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
