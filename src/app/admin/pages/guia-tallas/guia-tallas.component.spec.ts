import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaTallasComponent } from './guia-tallas.component';

describe('GuiaTallasComponent', () => {
  let component: GuiaTallasComponent;
  let fixture: ComponentFixture<GuiaTallasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuiaTallasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GuiaTallasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
