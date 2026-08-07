import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewWalkInPage } from './new-walk-in.page';

describe('NewWalkInPage', () => {
  let component: NewWalkInPage;
  let fixture: ComponentFixture<NewWalkInPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewWalkInPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
