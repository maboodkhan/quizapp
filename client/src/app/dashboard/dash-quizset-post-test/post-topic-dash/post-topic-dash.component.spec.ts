import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostTopicDashComponent } from './post-topic-dash.component';

describe('PostTopicDashComponent', () => {
  let component: PostTopicDashComponent;
  let fixture: ComponentFixture<PostTopicDashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostTopicDashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostTopicDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
