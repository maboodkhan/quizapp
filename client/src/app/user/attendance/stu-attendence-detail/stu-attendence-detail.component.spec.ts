import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StuAttendenceDetailComponent } from './stu-attendence-detail.component';

describe('StuAttendenceDetailComponent', () => {
  let component: StuAttendenceDetailComponent;
  let fixture: ComponentFixture<StuAttendenceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StuAttendenceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StuAttendenceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
