import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportgridComponent } from './reportgrid.component';

describe('ReportgridComponent', () => {
  let component: ReportgridComponent;
  let fixture: ComponentFixture<ReportgridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportgridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
