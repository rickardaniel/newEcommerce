import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarLayoutRigthComponent } from './sidebar-layout-rigth.component';

describe('SidebarLayoutRigthComponent', () => {
  let component: SidebarLayoutRigthComponent;
  let fixture: ComponentFixture<SidebarLayoutRigthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarLayoutRigthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SidebarLayoutRigthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
