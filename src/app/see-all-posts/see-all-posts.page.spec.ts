import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SeeAllPostsPage } from './see-all-posts.page';

describe('SeeAllPostsPage', () => {
  let component: SeeAllPostsPage;
  let fixture: ComponentFixture<SeeAllPostsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeeAllPostsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SeeAllPostsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
