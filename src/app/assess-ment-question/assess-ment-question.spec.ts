import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessMentQuestion } from './assess-ment-question';

describe('AssessMentQuestion', () => {
  let component: AssessMentQuestion;
  let fixture: ComponentFixture<AssessMentQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessMentQuestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessMentQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
