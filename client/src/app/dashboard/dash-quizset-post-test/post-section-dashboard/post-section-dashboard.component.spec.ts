import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostSectionDashboardComponent } from './post-section-dashboard.component';

describe('PostSectionDashboardComponent', () => {
  let component: PostSectionDashboardComponent;
  let fixture: ComponentFixture<PostSectionDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostSectionDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostSectionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
