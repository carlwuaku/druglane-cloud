import { TestBed } from '@angular/core/testing';

import { SecureImageService } from './secure-image-service.service';

describe('SecureImageServiceService', () => {
  let service: SecureImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
