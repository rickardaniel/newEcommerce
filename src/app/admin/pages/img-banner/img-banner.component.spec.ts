import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgBannerComponent } from './img-banner.component';

describe('ImgBannerComponent', () => {
  let component: ImgBannerComponent;
  let fixture: ComponentFixture<ImgBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImgBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImgBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
