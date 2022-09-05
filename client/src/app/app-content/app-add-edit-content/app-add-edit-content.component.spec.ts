import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAddEditContentComponent } from './app-add-edit-content.component';

describe('AppAddEditContentComponent', () => {
  let component: AppAddEditContentComponent;
  let fixture: ComponentFixture<AppAddEditContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppAddEditContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppAddEditContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
