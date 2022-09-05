import { TestBed } from '@angular/core/testing';

import { QuizSetService } from './quiz-set.service';

describe('QuizSetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QuizSetService = TestBed.get(QuizSetService);
    expect(service).toBeTruthy();
  });
});
