import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuetionPreviewComponent } from './quetion-preview.component';

describe('QuetionPreviewComponent', () => {
  let component: QuetionPreviewComponent;
  let fixture: ComponentFixture<QuetionPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuetionPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuetionPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
