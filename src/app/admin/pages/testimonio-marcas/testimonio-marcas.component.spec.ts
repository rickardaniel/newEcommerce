import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonioMarcasComponent } from './testimonio-marcas.component';

describe('TestimonioMarcasComponent', () => {
  let component: TestimonioMarcasComponent;
  let fixture: ComponentFixture<TestimonioMarcasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonioMarcasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestimonioMarcasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
