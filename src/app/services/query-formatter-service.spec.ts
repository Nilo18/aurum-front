import { QueryFormatterService } from './query-formatter-service';
describe('QueryFormatterService', () => {
  const service = new QueryFormatterService();
  it('omits absent values, preserves zero and false, and leaves the input unchanged', () => {
    const query = {
      page: 0,
      active: false,
      search: 'Nino',
      empty: '',
      missing: undefined,
      nil: null,
    };
    expect(service.removeEmptyProperties(query)).toEqual({
      page: '0',
      active: 'false',
      search: 'Nino',
    });
    expect(query.page).toBe(0);
    expect(query).toHaveProperty('empty', '');
  });
  it('handles empty queries and ignores inherited fields', () => {
    expect(service.removeEmptyProperties({})).toEqual({});
    expect(
      service.removeEmptyProperties(Object.assign(Object.create({ inherited: 1 }), { size: 10 })),
    ).toEqual({ size: '10' });
  });
});
