import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtraChargesPage } from './extra-charges.page';

describe('ExtraChargesPage', () => {
  let component: ExtraChargesPage;
  let fixture: ComponentFixture<ExtraChargesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtraChargesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
