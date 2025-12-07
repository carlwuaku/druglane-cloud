import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { appSettingsResolver } from './app-settings.resolver';

describe('appSettingsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => appSettingsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
