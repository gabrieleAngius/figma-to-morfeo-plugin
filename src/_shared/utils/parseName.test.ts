import { parseName } from './parseName';

describe('parseName', () => {
  it('should return camel case name', () => {
    const parsed = parseName('Primary Dark');
    expect(parsed).toBe('primaryDark');
  });

  it('should not break if the string is empty', () => {
    const parsed = parseName('');
    expect(parsed).toBe('');
  });

  it('should return expected name if contains symbols', () => {
    const parsed = parseName('primary  #darke$t');
    expect(parsed).toBe('primary#Darke$t');
  });

  it('should replace slash with dots', () => {
    const parsed = parseName('Primary/GreenLight');
    expect(parsed).toBe('primary.GreenLight');
  });
});
