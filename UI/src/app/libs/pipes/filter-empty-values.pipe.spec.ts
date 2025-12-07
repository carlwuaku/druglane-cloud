import { FilterEmptyValuesPipe } from './filter-empty-values.pipe';

describe('FilterEmptyValuesPipe', () => {
  it('create an instance', () => {
    const pipe = new FilterEmptyValuesPipe();
    expect(pipe).toBeTruthy();
  });
});
