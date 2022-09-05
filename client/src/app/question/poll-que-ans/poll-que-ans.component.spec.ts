import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PollQueAnsComponent } from './poll-que-ans.component';

describe('PollQueAnsComponent', () => {
  let component: PollQueAnsComponent;
  let fixture: ComponentFixture<PollQueAnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PollQueAnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollQueAnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
