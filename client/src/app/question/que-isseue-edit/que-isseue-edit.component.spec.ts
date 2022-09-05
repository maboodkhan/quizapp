import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueIsseueEditComponent } from './que-isseue-edit.component';

describe('QueIsseueEditComponent', () => {
  let component: QueIsseueEditComponent;
  let fixture: ComponentFixture<QueIsseueEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueIsseueEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueIsseueEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
