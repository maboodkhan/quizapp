import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineScheduleLessonComponent } from './online-schedule-lesson.component';

describe('OnlineScheduleLessonComponent', () => {
  let component: OnlineScheduleLessonComponent;
  let fixture: ComponentFixture<OnlineScheduleLessonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineScheduleLessonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineScheduleLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
