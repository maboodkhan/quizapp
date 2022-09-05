import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuesUserAssignComponent } from './ques-user-assign.component';

describe('QuesUserAssignComponent', () => {
  let component: QuesUserAssignComponent;
  let fixture: ComponentFixture<QuesUserAssignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuesUserAssignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuesUserAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
