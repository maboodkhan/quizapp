import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserClassNotifyComponent } from './user-class-notify.component';

describe('UserClassNotifyComponent', () => {
  let component: UserClassNotifyComponent;
  let fixture: ComponentFixture<UserClassNotifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserClassNotifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserClassNotifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
