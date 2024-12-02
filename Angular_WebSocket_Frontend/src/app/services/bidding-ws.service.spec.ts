import { TestBed } from '@angular/core/testing';

import { BiddingWsService } from './bidding-ws.service';

describe('BiddingWsService', () => {
  let service: BiddingWsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiddingWsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
