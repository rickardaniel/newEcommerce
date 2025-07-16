import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardGeneralComponent } from './card-general.component';

describe('CardGeneralComponent', () => {
  let component: CardGeneralComponent;
  let fixture: ComponentFixture<CardGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGeneralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
