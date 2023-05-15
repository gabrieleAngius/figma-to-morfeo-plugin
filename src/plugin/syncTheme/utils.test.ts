import { mockPageNode } from '../../../__mocks__/mockUtils';
import { PluginDataKeys } from '../../_shared/constants';
import * as GlobalUtils from '../utils/utils';
import { checkAndRemoveDeletedSlices } from './utils';

const mockDeleteNodesById = jest.fn();
jest.spyOn(GlobalUtils, 'deleteNodesById').mockImplementation(mockDeleteNodesById);

describe('checkAndRemoveDeletedSlices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call deleteNodesById and set updated variants if detect any deleted slices', () => {
    const themePage = mockPageNode({
      getSharedPluginData: jest.fn(() => JSON.stringify({ S: '12:12', M: '33:33', L: '44:11/#/44:22' })),
    });
    const existentSlicesKeys = ['S', 'M'];
    const updatedSliceRefs = checkAndRemoveDeletedSlices({
      themePage,
      existentSlicesKeys,
      pluginDataKey: PluginDataKeys.currentRadiiVariants,
    });

    // call deleteNodesById
    expect(mockDeleteNodesById).toBeCalledTimes(1);
    expect(mockDeleteNodesById).toBeCalledWith(['44:11', '44:22']);

    // call setSharedPluginData with non-deleted variants
    expect(updatedSliceRefs).toEqual({ S: '12:12', M: '33:33' });
  });
  it('should do nothing if getSharedPluginData returns an empty string', () => {
    const themePage = mockPageNode({ getSharedPluginData: jest.fn(() => '') });
    const updatedSliceRef = checkAndRemoveDeletedSlices({
      themePage,
      existentSlicesKeys: [],
      pluginDataKey: PluginDataKeys.currentRadiiVariants,
    });

    expect(updatedSliceRef).toEqual({});
    expect(mockDeleteNodesById).not.toBeCalled();
  });
});
