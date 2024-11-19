import { TestBed } from '@angular/core/testing';

import { BiddingHTTPService } from './bidding-http.service';

describe('BiddingHTTPService', () => {
  let service: BiddingHTTPService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiddingHTTPService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
