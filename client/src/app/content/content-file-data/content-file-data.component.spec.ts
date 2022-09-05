import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentFileDataComponent } from './content-file-data.component';

describe('ContentFileDataComponent', () => {
  let component: ContentFileDataComponent;
  let fixture: ComponentFixture<ContentFileDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentFileDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentFileDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
