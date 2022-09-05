import { TestBed, async, inject } from '@angular/core/testing';

import { QuizEditGuard } from './quiz-edit.guard';

describe('QuizEditGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuizEditGuard]
    });
  });

  it('should ...', inject([QuizEditGuard], (guard: QuizEditGuard) => {
    expect(guard).toBeTruthy();
  }));
});
