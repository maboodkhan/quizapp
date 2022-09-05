import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OldPreviewComponent } from './old-preview.component';

describe('OldPreviewComponent', () => {
  let component: OldPreviewComponent;
  let fixture: ComponentFixture<OldPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OldPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OldPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
