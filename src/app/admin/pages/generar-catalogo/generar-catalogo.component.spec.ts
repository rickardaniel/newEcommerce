import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarCatalogoComponent } from './generar-catalogo.component';

describe('GenerarCatalogoComponent', () => {
  let component: GenerarCatalogoComponent;
  let fixture: ComponentFixture<GenerarCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarCatalogoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerarCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
