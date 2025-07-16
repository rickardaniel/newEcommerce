import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColoresProductsComponent } from './colores-products.component';

describe('ColoresProductsComponent', () => {
  let component: ColoresProductsComponent;
  let fixture: ComponentFixture<ColoresProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColoresProductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColoresProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
