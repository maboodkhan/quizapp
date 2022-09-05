import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueAddRemarksComponent } from './que-add-remarks.component';

describe('QueAddRemarksComponent', () => {
  let component: QueAddRemarksComponent;
  let fixture: ComponentFixture<QueAddRemarksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueAddRemarksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueAddRemarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
