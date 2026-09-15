import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduleServicePage } from './schedule-service.page';

describe('ScheduleServicePage', () => {
  let component: ScheduleServicePage;
  let fixture: ComponentFixture<ScheduleServicePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleServicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
