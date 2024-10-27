import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoverComponent } from './layover.component';

describe('LayoverComponent', () => {
  let component: LayoverComponent;
  let fixture: ComponentFixture<LayoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
