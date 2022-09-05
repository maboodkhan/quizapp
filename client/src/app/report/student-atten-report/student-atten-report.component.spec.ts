import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAttenReportComponent } from './student-atten-report.component';

describe('StudentAttenReportComponent', () => {
  let component: StudentAttenReportComponent;
  let fixture: ComponentFixture<StudentAttenReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentAttenReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentAttenReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
