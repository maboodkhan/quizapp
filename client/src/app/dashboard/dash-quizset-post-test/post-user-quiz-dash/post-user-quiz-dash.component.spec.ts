import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostUserQuizDashComponent } from './post-user-quiz-dash.component';

describe('PostUserQuizDashComponent', () => {
  let component: PostUserQuizDashComponent;
  let fixture: ComponentFixture<PostUserQuizDashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostUserQuizDashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostUserQuizDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
