import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosInicioComponent } from './servicios-inicio.component';

describe('ServiciosInicioComponent', () => {
  let component: ServiciosInicioComponent;
  let fixture: ComponentFixture<ServiciosInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosInicioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiciosInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
