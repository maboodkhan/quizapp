import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLessonComponent } from './add-edit-lesson.component';

describe('AddEditLessonComponent', () => {
  let component: AddEditLessonComponent;
  let fixture: ComponentFixture<AddEditLessonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditLessonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
