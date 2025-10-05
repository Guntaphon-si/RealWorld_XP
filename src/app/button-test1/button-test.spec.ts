import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonTest } from './button-test';

describe('ButtonTest', () => {
  let component: ButtonTest;
  let fixture: ComponentFixture<ButtonTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
