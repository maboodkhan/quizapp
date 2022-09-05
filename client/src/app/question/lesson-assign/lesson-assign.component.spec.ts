import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonAssignComponent } from './lesson-assign.component';

describe('LessonAssignComponent', () => {
  let component: LessonAssignComponent;
  let fixture: ComponentFixture<LessonAssignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LessonAssignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LessonAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
