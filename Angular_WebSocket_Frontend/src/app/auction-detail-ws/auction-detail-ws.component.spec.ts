import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionDetailWsComponent } from './auction-detail-ws.component';

describe('AuctionDetailWsComponent', () => {
  let component: AuctionDetailWsComponent;
  let fixture: ComponentFixture<AuctionDetailWsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionDetailWsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionDetailWsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
