import { TestBed } from '@angular/core/testing';

import { PostDashboardService } from './post-dashboard.service';

describe('PostDashboardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PostDashboardService = TestBed.get(PostDashboardService);
    expect(service).toBeTruthy();
  });
});
