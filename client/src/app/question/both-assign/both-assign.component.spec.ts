import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BothAssignComponent } from './both-assign.component';

describe('BothAssignComponent', () => {
  let component: BothAssignComponent;
  let fixture: ComponentFixture<BothAssignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BothAssignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BothAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
