import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashQuizsetPostTestComponent } from './dash-quizset-post-test.component';

describe('DashQuizsetPostTestComponent', () => {
  let component: DashQuizsetPostTestComponent;
  let fixture: ComponentFixture<DashQuizsetPostTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashQuizsetPostTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashQuizsetPostTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
