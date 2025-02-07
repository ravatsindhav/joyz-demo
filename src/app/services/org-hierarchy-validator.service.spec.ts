import { TestBed } from '@angular/core/testing';

import { OrgHierarchyValidatorService } from './org-hierarchy-validator.service';

describe('OrgHierarchyValidatorService', () => {
  let service: OrgHierarchyValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgHierarchyValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
