import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BothPreviewComponent } from './both-preview.component';

describe('BothPreviewComponent', () => {
  let component: BothPreviewComponent;
  let fixture: ComponentFixture<BothPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BothPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BothPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
