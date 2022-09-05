import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostQuizChartComponent } from './post-quiz-chart.component';

describe('PostQuizChartComponent', () => {
  let component: PostQuizChartComponent;
  let fixture: ComponentFixture<PostQuizChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostQuizChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostQuizChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
