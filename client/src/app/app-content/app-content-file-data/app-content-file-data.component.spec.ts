import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppContentFileDataComponent } from './app-content-file-data.component';

describe('AppContentFileDataComponent', () => {
  let component: AppContentFileDataComponent;
  let fixture: ComponentFixture<AppContentFileDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppContentFileDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppContentFileDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
