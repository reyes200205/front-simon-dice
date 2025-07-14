import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidasIndexComponent } from './partidas-index.component';

describe('PartidasIndexComponent', () => {
  let component: PartidasIndexComponent;
  let fixture: ComponentFixture<PartidasIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartidasIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartidasIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
