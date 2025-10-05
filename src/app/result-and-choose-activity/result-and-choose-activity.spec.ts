import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultAndChooseActivity } from './result-and-choose-activity';

describe('ResultAndChooseActivity', () => {
  let component: ResultAndChooseActivity;
  let fixture: ComponentFixture<ResultAndChooseActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultAndChooseActivity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultAndChooseActivity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
