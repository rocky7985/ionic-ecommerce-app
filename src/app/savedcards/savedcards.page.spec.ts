import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SavedcardsPage } from './savedcards.page';

describe('SavedcardsPage', () => {
  let component: SavedcardsPage;
  let fixture: ComponentFixture<SavedcardsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedcardsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
