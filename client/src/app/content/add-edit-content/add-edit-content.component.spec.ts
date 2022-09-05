import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditContentComponent } from './add-edit-content.component';

describe('AddEditContentComponent', () => {
  let component: AddEditContentComponent;
  let fixture: ComponentFixture<AddEditContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
