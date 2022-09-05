import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTypeAddEditComponent } from './user-type-add-edit.component';

describe('UserTypeAddEditComponent', () => {
  let component: UserTypeAddEditComponent;
  let fixture: ComponentFixture<UserTypeAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTypeAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTypeAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
