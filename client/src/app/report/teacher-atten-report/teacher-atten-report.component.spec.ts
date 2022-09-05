import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherAttenReportComponent } from './teacher-atten-report.component';

describe('TeacherAttenReportComponent', () => {
  let component: TeacherAttenReportComponent;
  let fixture: ComponentFixture<TeacherAttenReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherAttenReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherAttenReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
