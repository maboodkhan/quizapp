import { TestBed } from '@angular/core/testing';

import { AppContentService } from './app-content.service';

describe('AppContentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppContentService = TestBed.get(AppContentService);
    expect(service).toBeTruthy();
  });
});
