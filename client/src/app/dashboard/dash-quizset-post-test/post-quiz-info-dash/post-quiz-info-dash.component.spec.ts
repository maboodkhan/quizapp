import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostQuizInfoDashComponent } from './post-quiz-info-dash.component';

describe('PostQuizInfoDashComponent', () => {
  let component: PostQuizInfoDashComponent;
  let fixture: ComponentFixture<PostQuizInfoDashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostQuizInfoDashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostQuizInfoDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
