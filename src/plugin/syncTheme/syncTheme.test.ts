import { mockNotify, mockRootChildren, mockGetNodeById } from '../../../__mocks__/figmaMock';
import { THEME_PAGE_NAME } from '../../_shared/constants';
import { ActionTypes } from '../../_shared/types/actions';
import { syncTheme } from './syncTheme';
import {
  mockAppendChild,
  mockBorderWidthCombinations,
  mockDefaultPage,
  mockRadiiCombinations,
  spyCreateInstance,
  mockSyncTheme,
} from './mock';

describe('syncTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSyncTheme();
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
      ...mockDefaultPage,
      findOne: jest.fn(() => null),
    });

    syncTheme({ type: ActionTypes.syncTheme });

    expect(mockNotify).toBeCalledWith(
      'Cannot find all the slices. If you delete some of them, please undo that change',
      { error: true, timeout: 3000 }
    );

    expect(spyCreateInstance).not.toBeCalled();
  });

  test('Should not sync the theme if the radii or borderWidth frames do not have children', () => {
    mockRootChildren.push({
      ...mockDefaultPage,
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
      ...mockDefaultPage,
    });
    mockGetNodeById.mockReturnValue({ type: 'COMPONENT' });
    syncTheme({ type: ActionTypes.syncTheme });

    expect(mockNotify).toBeCalledWith('Cant find the BOX primitive component', { error: true });
  });

  test('Should call createInstance with the new radii and borderRadius combination', () => {
    mockRootChildren.push({
      ...mockDefaultPage,
    });
    syncTheme({ type: ActionTypes.syncTheme });

    expect(spyCreateInstance).toBeCalledWith([...mockRadiiCombinations, ...mockBorderWidthCombinations]);
  });

  test('Should call appendChild for each new variants created', () => {
    mockRootChildren.push({
      ...mockDefaultPage,
    });
    syncTheme({ type: ActionTypes.syncTheme });

    expect(mockAppendChild).toBeCalledTimes([...mockRadiiCombinations, ...mockBorderWidthCombinations].length);
  });
});
