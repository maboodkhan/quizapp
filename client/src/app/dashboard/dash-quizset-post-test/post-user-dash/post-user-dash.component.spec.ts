import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostUserDashComponent } from './post-user-dash.component';

describe('PostUserDashComponent', () => {
  let component: PostUserDashComponent;
  let fixture: ComponentFixture<PostUserDashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostUserDashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostUserDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
