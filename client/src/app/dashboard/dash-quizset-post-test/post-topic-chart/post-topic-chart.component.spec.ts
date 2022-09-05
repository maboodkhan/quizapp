import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostTopicChartComponent } from './post-topic-chart.component';

describe('PostTopicChartComponent', () => {
  let component: PostTopicChartComponent;
  let fixture: ComponentFixture<PostTopicChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostTopicChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostTopicChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
