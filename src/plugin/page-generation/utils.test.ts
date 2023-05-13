import { Slices } from '../../_shared/constants';
import { createInstances, getVariantCombinations, updateVariantName } from './utils';

describe('get variants', () => {
  it('should return expected combinations', () => {
    const res = getVariantCombinations([
      { sliceName: Slices.Radius, variants: { S: 1, M: 2, L: 3 }, styleKey: 'cornerRadius' },
      { sliceName: Slices.BorderWidth, variants: { X: 1, Y: 2 }, styleKey: 'strokeWeight' },
      { sliceName: 'Spacing' as Slices, variants: { A: 1, B: 2 }, styleKey: 'space' as any },
    ]);

    expect(res).toEqual([
      { name: 'Radius=S, Border width=X, Spacing=A', cornerRadius: 1, strokeWeight: 1, space: 1 },
      { name: 'Radius=S, Border width=X, Spacing=B', cornerRadius: 1, strokeWeight: 1, space: 2 },
      { name: 'Radius=S, Border width=Y, Spacing=A', cornerRadius: 1, strokeWeight: 2, space: 1 },
      { name: 'Radius=S, Border width=Y, Spacing=B', cornerRadius: 1, strokeWeight: 2, space: 2 },

      { name: 'Radius=M, Border width=X, Spacing=A', cornerRadius: 2, strokeWeight: 1, space: 1 },
      { name: 'Radius=M, Border width=X, Spacing=B', cornerRadius: 2, strokeWeight: 1, space: 2 },
      { name: 'Radius=M, Border width=Y, Spacing=A', cornerRadius: 2, strokeWeight: 2, space: 1 },
      { name: 'Radius=M, Border width=Y, Spacing=B', cornerRadius: 2, strokeWeight: 2, space: 2 },

      { name: 'Radius=L, Border width=X, Spacing=A', cornerRadius: 3, strokeWeight: 1, space: 1 },
      { name: 'Radius=L, Border width=X, Spacing=B', cornerRadius: 3, strokeWeight: 1, space: 2 },
      { name: 'Radius=L, Border width=Y, Spacing=A', cornerRadius: 3, strokeWeight: 2, space: 1 },
      { name: 'Radius=L, Border width=Y, Spacing=B', cornerRadius: 3, strokeWeight: 2, space: 2 },
    ]);
  });

  it('should be possible to add a variant', () => {
    const res1 = getVariantCombinations([
      { sliceName: Slices.Radius, variants: { XL: 10 }, styleKey: 'cornerRadius' },
      { sliceName: Slices.BorderWidth, variants: { X: 1, Y: 2 }, styleKey: 'strokeWeight' },
    ]);

    const res2 = getVariantCombinations([
      { sliceName: Slices.Radius, variants: { S: 1, M: 2, L: 3, XL: 10 }, styleKey: 'cornerRadius' },
      { sliceName: Slices.BorderWidth, variants: { Z: 4 }, styleKey: 'strokeWeight' },
    ]);

    const result = [...res1, ...res2];

    expect(result).toEqual([
      expect.objectContaining({ name: 'Radius=XL, Border width=X', cornerRadius: 10, strokeWeight: 1 }),
      expect.objectContaining({ name: 'Radius=XL, Border width=Y', cornerRadius: 10, strokeWeight: 2 }),

      expect.objectContaining({ name: 'Radius=S, Border width=Z', cornerRadius: 1, strokeWeight: 4 }),
      expect.objectContaining({ name: 'Radius=M, Border width=Z', cornerRadius: 2, strokeWeight: 4 }),
      expect.objectContaining({ name: 'Radius=L, Border width=Z', cornerRadius: 3, strokeWeight: 4 }),
      expect.objectContaining({ name: 'Radius=XL, Border width=Z', cornerRadius: 10, strokeWeight: 4 }),
    ]);
  });
});

describe('createInstances', () => {
  it('should return expected refs', () => {
    const combinations = [
      { name: 'Radius=S, Border width=X', cornerRadius: 1, strokeWeight: 1, ciao: 1 },
      { name: 'Radius=S, Border width=X', cornerRadius: 1, strokeWeight: 1, ciao: 2 },
      { name: 'Radius=S, Border width=Y', cornerRadius: 1, strokeWeight: 2, ciao: 1 },
      { name: 'Radius=S, Border width=Y', cornerRadius: 1, strokeWeight: 2, ciao: 2 },
    ];

    const { instances, refIds } = createInstances(combinations);

    expect(refIds).toEqual({
      Radius: {
        S: `${instances[0].id}/#/${instances[1].id}/#/${instances[2].id}/#/${instances[3].id}`,
      },
      'Border width': {
        X: `${instances[0].id}/#/${instances[1].id}`,
        Y: `${instances[2].id}/#/${instances[3].id}`,
      },
    });
  });
});

describe('updateVariantName', () => {
  it('should replace the variant name for the provided slice, without mutating the input', () => {
    const oldName = `${Slices.Radius}=S, ${Slices.BorderWidth}=F`;
    const newName = updateVariantName({ instanceName: oldName, sliceName: Slices.Radius, newVariantName: 'A' });
    const newName2 = updateVariantName({
      instanceName: oldName,
      sliceName: Slices.BorderWidth,
      newVariantName: 'none',
    });

    const expectedName = `${Slices.Radius}=A, ${Slices.BorderWidth}=F`;
    const expectedName2 = `${Slices.Radius}=S, ${Slices.BorderWidth}=none`;

    expect(newName).toBe(expectedName);
    expect(newName2).toBe(expectedName2);
  });
});
