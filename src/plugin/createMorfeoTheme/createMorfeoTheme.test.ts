import { mockRootChildren, mockCreatePage, mockNotify } from '../../../__mocks__/figmaMock';
import { ActionTypes } from '../../_shared/types/actions';
import { createMorfeoTheme } from './createMorfeoTheme';

describe('createMorfeoTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should not create the page if it already exist', () => {
    mockRootChildren.push({ name: '#Morfeo theme' });

    createMorfeoTheme({ type: ActionTypes.createMorfeoTheme });

    expect(mockCreatePage).not.toBeCalled();
    expect(mockNotify).toBeCalledTimes(1);
    expect(mockNotify).toBeCalledWith(expect.any(String), expect.objectContaining({ error: true }));

    // clean mockRootChildren so it will not affect any other test
    mockRootChildren.length = 0;
  });

  it('should create the page if it does not exist', () => {
    createMorfeoTheme({ type: ActionTypes.createMorfeoTheme });

    expect(mockCreatePage).toBeCalledTimes(1);

    expect(mockNotify).toBeCalledTimes(1);
    expect(mockNotify).toBeCalledWith('Theme page created!');
  });
});
