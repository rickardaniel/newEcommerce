import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarVaucherComponent } from './generar-vaucher.component';

describe('GenerarVaucherComponent', () => {
  let component: GenerarVaucherComponent;
  let fixture: ComponentFixture<GenerarVaucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarVaucherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerarVaucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
