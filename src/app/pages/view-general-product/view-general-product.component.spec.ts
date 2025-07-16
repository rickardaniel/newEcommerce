import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGeneralProductComponent } from './view-general-product.component';

describe('ViewGeneralProductComponent', () => {
  let component: ViewGeneralProductComponent;
  let fixture: ComponentFixture<ViewGeneralProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGeneralProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewGeneralProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
