import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomFeaturesPage } from './custom-features.page';

describe('CustomFeaturesPage', () => {
  let component: CustomFeaturesPage;
  let fixture: ComponentFixture<CustomFeaturesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomFeaturesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
