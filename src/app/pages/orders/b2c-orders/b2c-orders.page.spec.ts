import { ComponentFixture, TestBed } from '@angular/core/testing';
import { B2cOrdersPage } from './b2c-orders.page';

describe('B2cOrdersPage', () => {
  let component: B2cOrdersPage;
  let fixture: ComponentFixture<B2cOrdersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(B2cOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
