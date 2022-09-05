import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTopicComponent } from './add-edit-topic.component';

describe('AddEditTopicComponent', () => {
  let component: AddEditTopicComponent;
  let fixture: ComponentFixture<AddEditTopicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditTopicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
