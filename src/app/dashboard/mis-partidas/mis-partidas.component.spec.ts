import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisPartidasComponent } from './mis-partidas.component';

describe('MisPartidasComponent', () => {
  let component: MisPartidasComponent;
  let fixture: ComponentFixture<MisPartidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPartidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisPartidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
