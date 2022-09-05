import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUserMoreDetailComponent } from './app-user-more-detail.component';

describe('AppUserMoreDetailComponent', () => {
  let component: AppUserMoreDetailComponent;
  let fixture: ComponentFixture<AppUserMoreDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppUserMoreDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppUserMoreDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
