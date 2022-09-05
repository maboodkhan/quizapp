import { TestBed } from '@angular/core/testing';

import { OnlineScheduleService } from './online-schedule.service';

describe('OnlineScheduleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OnlineScheduleService = TestBed.get(OnlineScheduleService);
    expect(service).toBeTruthy();
  });
});
