import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDataAddEditComponent } from './user-data-add-edit.component';

describe('UserDataAddEditComponent', () => {
  let component: UserDataAddEditComponent;
  let fixture: ComponentFixture<UserDataAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDataAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDataAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
