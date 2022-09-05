import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuesAddEditComponent } from './ques-add-edit.component';

describe('QuesAddEditComponent', () => {
  let component: QuesAddEditComponent;
  let fixture: ComponentFixture<QuesAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuesAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuesAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
