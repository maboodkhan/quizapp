import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleSchoolNotifyComponent } from './schedule-school-notify.component';

describe('ScheduleSchoolNotifyComponent', () => {
  let component: ScheduleSchoolNotifyComponent;
  let fixture: ComponentFixture<ScheduleSchoolNotifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleSchoolNotifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleSchoolNotifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
