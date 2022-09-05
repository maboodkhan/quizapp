import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSclScheduleNotiComponent } from './add-scl-schedule-noti.component';

describe('AddSclScheduleNotiComponent', () => {
  let component: AddSclScheduleNotiComponent;
  let fixture: ComponentFixture<AddSclScheduleNotiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSclScheduleNotiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSclScheduleNotiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
