import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadDataListComponent } from './load-data-list.component';

describe('LoadDataListComponent', () => {
  let component: LoadDataListComponent;
  let fixture: ComponentFixture<LoadDataListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadDataListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadDataListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
