import { mockGetNodeById, mockNotify } from '../../../__mocks__/figmaMock';
import { mockNode } from '../../../__mocks__/mockUtils';
import { PluginDataKeys } from '../../_shared/constants';
import * as GlobalUtils from '../utils/utils';
import {
  ErrorMap,
  ErrorType,
  checkAndRemoveDeletedSlices,
  generateAndRecordErrorMessage,
  notifyErrorMessages,
  syncBorderWidthVariants,
  syncRadiiVariants,
} from './utils';

const errorMap: ErrorMap = {
  [ErrorType.WRONG_ELEMENT_TYPE]: [],
  [ErrorType.MIXED_SLICE_VALUES]: [],
  [ErrorType.DUPLICATED_SLICE_NAME]: [],
};

function resetErrorMap() {
  errorMap[ErrorType.WRONG_ELEMENT_TYPE] = [];
  errorMap[ErrorType.MIXED_SLICE_VALUES] = [];
  errorMap[ErrorType.DUPLICATED_SLICE_NAME] = [];
}

describe('syncRadiiVariants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetErrorMap();
  });
  it('should return existent slices and new slices', () => {
    mockGetNodeById.mockReturnValue(mockNode<ComponentNode>({ type: 'COMPONENT', name: '' }));
    const radiiFrame = {
      children: [
        mockNode<RectangleNode>({
          type: 'RECTANGLE',
          cornerRadius: 1,
          name: 'S',
          getSharedPluginData: jest.fn(() => '11:22/#/33:44'),
        }),
        mockNode<RectangleNode>({
          type: 'RECTANGLE',
          cornerRadius: 2,
          name: 'M',
          getSharedPluginData: jest.fn(() => ''),
        }),
      ],
    } as unknown as FrameNode;

    const { existentRadiusSlices, newRadiusSlices } = syncRadiiVariants(radiiFrame, errorMap);

    expect(existentRadiusSlices).toEqual({ S: 1 });
    expect(newRadiusSlices).toEqual({ M: 2 });
  });

  it('should ignore non-rectangle children', () => {
    const radiiFrame = {
      children: [
        mockNode<LineNode>({
          type: 'LINE',
          name: 'S',
          getSharedPluginData: jest.fn(() => ''),
        }),
      ],
    } as unknown as FrameNode;

    const { existentRadiusSlices, newRadiusSlices } = syncRadiiVariants(radiiFrame, errorMap);

    expect(existentRadiusSlices).toEqual({});
    expect(newRadiusSlices).toEqual({});
    expect(radiiFrame.children[0].getSharedPluginData).not.toBeCalled();
    expect(errorMap[ErrorType.WRONG_ELEMENT_TYPE]).toHaveLength(1);
  });

  it('should notify the user if he used mixed values for corner radius', () => {
    const radiiFrame = {
      children: [
        mockNode<RectangleNode>({
          type: 'RECTANGLE',
          cornerRadius: figma.mixed,
          name: 'S',
          getSharedPluginData: jest.fn(() => ''),
        }),
      ],
    } as unknown as FrameNode;

    const { existentRadiusSlices, newRadiusSlices } = syncRadiiVariants(radiiFrame, errorMap);

    expect(existentRadiusSlices).toEqual({});
    expect(newRadiusSlices).toEqual({});
    expect(errorMap[ErrorType.MIXED_SLICE_VALUES]).toHaveLength(1);
  });

  it('should notify the user if there are two slices with the same name', () => {
    mockGetNodeById.mockReturnValue(mockNode<ComponentNode>({ type: 'COMPONENT', name: '' }));
    const radiiFrame = {
      children: [
        mockNode<RectangleNode>({
          type: 'RECTANGLE',
          cornerRadius: 1,
          name: 'S',
          getSharedPluginData: jest.fn(() => '11:22'),
        }),
        mockNode<RectangleNode>({
          type: 'RECTANGLE',
          cornerRadius: 2,
          name: 'S',
          getSharedPluginData: jest.fn(() => ''),
        }),
      ],
    } as unknown as FrameNode;

    const { existentRadiusSlices, newRadiusSlices } = syncRadiiVariants(radiiFrame, errorMap);

    expect(existentRadiusSlices).toEqual({ S: 1 });
    expect(newRadiusSlices).toEqual({});
    expect(errorMap[ErrorType.DUPLICATED_SLICE_NAME]).toHaveLength(1);
  });
});

describe('syncBorderWidthVariants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetErrorMap();
  });
  it('should return existent slices and new slices', () => {
    mockGetNodeById.mockReturnValue(mockNode<ComponentNode>({ type: 'COMPONENT', name: '' }));
    const borderWidthFrame = {
      children: [
        mockNode<LineNode>({
          type: 'LINE',
          strokeWeight: 1,
          name: 'S',
          getSharedPluginData: jest.fn(() => '11:22/#/33:44'),
        }),
        mockNode<LineNode>({
          type: 'LINE',
          strokeWeight: 2,
          name: 'M',
          getSharedPluginData: jest.fn(() => ''),
        }),
      ],
    } as unknown as FrameNode;

    const { existentBorderWidthSlices, newBorderWidthSlices } = syncBorderWidthVariants(borderWidthFrame, errorMap);

    expect(existentBorderWidthSlices).toEqual({ S: 1 });
    expect(newBorderWidthSlices).toEqual({ M: 2 });
  });

  it('should ignore non-line children', () => {
    const borderWidthFrame = {
      children: [
        mockNode<RectangleNode>({
          type: 'RECTANGLE',
          name: 'S',
          getSharedPluginData: jest.fn(() => ''),
        }),
      ],
    } as unknown as FrameNode;

    const { existentBorderWidthSlices, newBorderWidthSlices } = syncBorderWidthVariants(borderWidthFrame, errorMap);

    expect(existentBorderWidthSlices).toEqual({});
    expect(newBorderWidthSlices).toEqual({});
    expect(borderWidthFrame.children[0].getSharedPluginData).not.toBeCalled();
    expect(errorMap[ErrorType.WRONG_ELEMENT_TYPE]).toHaveLength(1);
  });

  it('should notify the user if he used mixed values for stroke weight', () => {
    const borderWidthFrame = {
      children: [
        mockNode<LineNode>({
          type: 'LINE',
          strokeWeight: figma.mixed,
          name: 'S',
          getSharedPluginData: jest.fn(() => ''),
        }),
      ],
    } as unknown as FrameNode;

    const { existentBorderWidthSlices, newBorderWidthSlices } = syncBorderWidthVariants(borderWidthFrame, errorMap);

    expect(existentBorderWidthSlices).toEqual({});
    expect(newBorderWidthSlices).toEqual({});
    expect(errorMap[ErrorType.MIXED_SLICE_VALUES]).toHaveLength(1);
  });

  it('should notify the user if there are two slices with the same name', () => {
    mockGetNodeById.mockReturnValue(mockNode<ComponentNode>({ type: 'COMPONENT', name: '' }));
    const borderWidthFrame = {
      children: [
        mockNode<LineNode>({
          type: 'LINE',
          strokeWeight: 1,
          name: 'S',
          getSharedPluginData: jest.fn(() => '11:22'),
        }),
        mockNode<LineNode>({
          type: 'LINE',
          strokeWeight: 2,
          name: 'S',
          getSharedPluginData: jest.fn(() => ''),
        }),
      ],
    } as unknown as FrameNode;

    const { existentBorderWidthSlices, newBorderWidthSlices } = syncBorderWidthVariants(borderWidthFrame, errorMap);

    expect(existentBorderWidthSlices).toEqual({ S: 1 });
    expect(newBorderWidthSlices).toEqual({});
    expect(errorMap[ErrorType.DUPLICATED_SLICE_NAME]).toHaveLength(1);
  });
});

const mockDeleteNodesById = jest.fn();
jest.spyOn(GlobalUtils, 'deleteNodesById').mockImplementation(mockDeleteNodesById);

describe('checkAndRemoveDeletedSlices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetErrorMap();
  });
  it('should call deleteNodesById and set updated variants if detect any deleted slices', () => {
    const themePage = mockNode<PageNode>({
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
    const themePage = mockNode<PageNode>({ getSharedPluginData: jest.fn(() => '') });
    const updatedSliceRef = checkAndRemoveDeletedSlices({
      themePage,
      existentSlicesKeys: [],
      pluginDataKey: PluginDataKeys.currentRadiiVariants,
    });

    expect(updatedSliceRef).toEqual({});
    expect(mockDeleteNodesById).not.toBeCalled();
  });
});

describe('notifyErrorMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetErrorMap();
  });

  test('should notify the user if there are any errors', () => {
    const currentErrorMap: ErrorMap = {
      [ErrorType.DUPLICATED_SLICE_NAME]: ['anyError'],
      [ErrorType.MIXED_SLICE_VALUES]: ['anyError'],
      [ErrorType.WRONG_ELEMENT_TYPE]: ['anyError'],
    };

    notifyErrorMessages(currentErrorMap);

    expect(mockNotify).toBeCalledTimes(
      [
        ...currentErrorMap[ErrorType.DUPLICATED_SLICE_NAME],
        ...currentErrorMap[ErrorType.MIXED_SLICE_VALUES],
        ...currentErrorMap[ErrorType.WRONG_ELEMENT_TYPE],
      ].length
    );
  });

  test('generateAndNotifyErrorMessage should create and add a new error message to the error map', () => {
    generateAndRecordErrorMessage({
      errorMap,
      errorType: ErrorType.DUPLICATED_SLICE_NAME,
      values: { sliceName: 'anySliceName', variantName: 'anyVariantName' },
    });

    expect(errorMap[ErrorType.DUPLICATED_SLICE_NAME]).toHaveLength(1);
  });

  test('should not notify the user if there are no errors', () => {
    notifyErrorMessages(errorMap);
    expect(mockNotify).not.toBeCalled();
  });
});
