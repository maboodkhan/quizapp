import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuizHistoryComponent } from './user-quiz-history.component';

describe('UserQuizHistoryComponent', () => {
  let component: UserQuizHistoryComponent;
  let fixture: ComponentFixture<UserQuizHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuizHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuizHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
