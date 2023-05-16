import { mockNotify, mockRootChildren, mockGetNodeById } from '../../../__mocks__/figmaMock';
import { SliceFrameNames, THEME_PAGE_NAME } from '../../_shared/constants';
import { ActionTypes } from '../../_shared/types/actions';
import { syncTheme } from './syncTheme';
import * as SyncUtils from './utils';
import * as GlobalUtils from '../utils/utils';
import { mockNode } from '../../../__mocks__/mockUtils';

const mockRadiiCombinations = [
  { name: 'Radius=XL, Border width=X', cornerRadius: 10, strokeWeight: 1 },
  { name: 'Radius=XL, Border width=Y', cornerRadius: 10, strokeWeight: 2 },
];

const mockBorderWidthCombinations = [
  { name: 'Radius=S, Border width=Z', cornerRadius: 1, strokeWeight: 4 },
  { name: 'Radius=M, Border width=Z', cornerRadius: 2, strokeWeight: 4 },
];

const mockFindOne = jest.fn(() => ({
  name: SliceFrameNames.BorderWidth,
  type: 'FRAME',
  children: {
    type: 'FRAME',
    name: 'Box',
    children: [],
  },
}));

const spyCreateInstance = jest.spyOn(GlobalUtils, 'createInstances');
const mockAppendChild = jest.fn();

const defaultPage = mockNode({
  name: THEME_PAGE_NAME,
  findOne: mockFindOne as any,
  getSharedPluginData: jest.fn(() => '123'),
  setSharedPluginData: jest.fn(),
});

describe('syncTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(SyncUtils, 'syncBorderWidthVariants').mockReturnValue({
      existentBorderWidthSlices: {},
      newBorderWidthSlices: {},
    });
    jest
      .spyOn(GlobalUtils, 'getVariantCombinations')
      .mockReturnValueOnce(mockRadiiCombinations)
      .mockReturnValueOnce(mockBorderWidthCombinations);

    jest.spyOn(GlobalUtils, 'setRefs').mockImplementation(jest.fn());

    jest.spyOn(SyncUtils, 'syncRadiiVariants').mockReturnValue({ existentRadiusSlices: {}, newRadiusSlices: {} });

    jest
      .spyOn(SyncUtils, 'syncBorderWidthVariants')
      .mockReturnValue({ existentBorderWidthSlices: {}, newBorderWidthSlices: {} });
    mockGetNodeById.mockReturnValue({ type: 'COMPONENT_SET', appendChild: mockAppendChild });

    mockRootChildren.length = 0;
  });

  test('Should not sync the theme if the page does not exist', () => {
    syncTheme({ type: ActionTypes.syncTheme });

    expect(mockNotify).toBeCalledWith(
      `Cannot find a '${THEME_PAGE_NAME}' page. Please use 'Create theme page' function of the plugin before sync`,
      { error: true, timeout: 5000 }
    );
  });

  test('Should not sync the theme if the frames of radii and borderWidth do not exist', () => {
    mockRootChildren.push({
      ...defaultPage,
      findOne: jest.fn(() => null),
    });

    syncTheme({ type: ActionTypes.syncTheme });

    expect(mockNotify).toBeCalledWith(
      'Cannot find all the slices. If you delete some of them, please undo that change',
      {
        error: true,
        timeout: 3000,
      }
    );

    expect(spyCreateInstance).not.toBeCalled();
  });

  test('Should not sync the theme if the radii or borderWidth frames do not have children', () => {
    mockRootChildren.push({
      ...defaultPage,
      findOne: jest.fn(() => ({
        children: [],
      })),
    });

    syncTheme({ type: ActionTypes.syncTheme });

    expect(spyCreateInstance).not.toBeCalled();
    expect(mockNotify).toBeCalledWith('Detected some empty slices. Please keep at least one variant for each slice', {
      error: true,
      timeout: 3000,
    });
  });

  test('Should not sync the theme if the boxComponent does not have a COMPONENT_SET as type', () => {
    mockRootChildren.push({
      ...defaultPage,
    });
    mockGetNodeById.mockReturnValue({ type: 'COMPONENT' });
    syncTheme({ type: ActionTypes.syncTheme });

    expect(mockNotify).toBeCalledWith('Cant find the BOX primitive component', { error: true });
  });

  test('Should call createInstance with the new radii and borderRadius combination', () => {
    mockRootChildren.push({
      ...defaultPage,
    });
    syncTheme({ type: ActionTypes.syncTheme });

    expect(spyCreateInstance).toBeCalledWith([...mockRadiiCombinations, ...mockBorderWidthCombinations]);
  });

  test('Should call appendChild for each new variants created', () => {
    mockRootChildren.push({
      ...defaultPage,
    });
    syncTheme({ type: ActionTypes.syncTheme });

    expect(mockAppendChild).toBeCalledTimes([...mockRadiiCombinations, ...mockBorderWidthCombinations].length);
  });
});
