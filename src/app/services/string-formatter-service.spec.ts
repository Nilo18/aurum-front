import { StringFormatterService } from './string-formatter-service';
describe('StringFormatterService', () => {
  const service = new StringFormatterService();
  it.each([
    ['FOOD_INGREDIENT', 'Food ingredient'],
    ['STAFF', 'Staff'],
    ['Guest name', 'Guest name'],
    [null, ''],
    [undefined, ''],
    [123, '123'],
  ])('humanizes %s', (value, expected) => {
    expect(service.human(value)).toBe(expected);
  });
  it.each([
    [1234.5, '₾ 1,234.50'],
    [0, '₾ 0.00'],
    [-10, '₾ -10.00'],
    ['12.3', '₾ 12.30'],
  ])('formats currency %s', (value, expected) => {
    expect(service.currency(value)).toBe(expected);
  });
});
