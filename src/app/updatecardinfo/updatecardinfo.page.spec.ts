import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdatecardinfoPage } from './updatecardinfo.page';

describe('UpdatecardinfoPage', () => {
  let component: UpdatecardinfoPage;
  let fixture: ComponentFixture<UpdatecardinfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatecardinfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
