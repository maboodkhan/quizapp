import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostStudentQuizChatComponent } from './post-student-quiz-chat.component';

describe('PostStudentQuizChatComponent', () => {
  let component: PostStudentQuizChatComponent;
  let fixture: ComponentFixture<PostStudentQuizChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostStudentQuizChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostStudentQuizChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
