import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectObjectComponent } from './select-object.component';

describe('SelectObjectComponent', () => {
  let component: SelectObjectComponent;
  let fixture: ComponentFixture<SelectObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectObjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
