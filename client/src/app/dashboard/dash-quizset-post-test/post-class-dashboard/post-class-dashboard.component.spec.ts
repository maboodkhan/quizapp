import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostClassDashboardComponent } from './post-class-dashboard.component';

describe('PostClassDashboardComponent', () => {
  let component: PostClassDashboardComponent;
  let fixture: ComponentFixture<PostClassDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostClassDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostClassDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
