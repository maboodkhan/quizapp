import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostUserListDashComponent } from './post-user-list-dash.component';

describe('PostUserListDashComponent', () => {
  let component: PostUserListDashComponent;
  let fixture: ComponentFixture<PostUserListDashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostUserListDashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostUserListDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
