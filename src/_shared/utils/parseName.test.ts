import { parseName } from './parseName';

describe('parseName', () => {
  it('should return camel case name', () => {
    const camelized = parseName('Primary Dark');
    expect(camelized).toBe('primaryDark');
  });

  it('should not break if the string is empty', () => {
    const camelized = parseName('');
    expect(camelized).toBe('');
  });

  it('should return expected name if contains symbols', () => {
    const camelized = parseName('primary  #darke$t');
    expect(camelized).toBe('primary#Darke$t');
  });

  it('should replace slash with dots', () => {
    const camelized = parseName('Primary/GreenLight');
    expect(camelized).toBe('primary.GreenLight');
  });
});
