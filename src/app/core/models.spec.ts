import { normalizeText } from './models';

describe('normalizeText', () => {
  it('lowercases, trims and strips accents', () => {
    expect(normalizeText("  Côte d'Ivoire ")).toBe("cote d'ivoire");
    expect(normalizeText('São Tomé')).toBe('sao tome');
  });
});
