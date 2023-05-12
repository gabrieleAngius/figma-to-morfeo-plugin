import {
  mockGetLocalPaintStyles,
  mockUiPostMessage,
  mockNotify,
  mockRootChildren,
  mockCreatePage,
} from '../../__mocks__/figmaMock';
import { ActionTypes } from '../_shared/types/actions';
import { controllers } from './pluginControllers';

describe('resolvers', () => {
  describe('generate theme', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should send an empty meta if there are no valid colors', () => {
      controllers['generate-theme']({ type: ActionTypes.generateTheme });

      expect(mockUiPostMessage).toBeCalledWith({
        meta: {},
        type: 'download-file',
      });
    });

    it('should generate the theme and send a message with meta to the UI', () => {
      const paintStyles = [
        {
          name: 'Color 1',
          id: '',
          description: '',
          paints: [{ type: 'SOLID', color: { r: 0.1234, g: 0.00123, b: 0.789234 } }],
        },
        {
          name: 'Color 2',
          id: '',
          description: '',
          paints: [{ type: 'SOLID', color: { r: 0.412345, g: 0.223452, b: 0.31231231 }, opacity: 0.6 }],
        },
      ] as Partial<PaintStyle>[];

      mockGetLocalPaintStyles.mockReturnValue(paintStyles);
      controllers['generate-theme']({ type: ActionTypes.generateTheme });

      expect(mockUiPostMessage).toBeCalledWith({
        meta: {
          'Color 1': 'rgba(31,0,201,1)',
          'Color 2': 'rgba(105,57,80,0.6)',
        },
        type: 'download-file',
      });
    });

    it('should generate expected theme mixing layers if a Paint contains many of them', () => {
      const paintStyles = [
        {
          name: 'Color 1',
          id: '',
          description: '',
          paints: [
            { type: 'SOLID', color: { r: 1, g: 0, b: 0 } },
            {
              type: 'SOLID',
              color: { r: 0.2784313725490196, g: 0.3333333333333333, b: 0.4117647058823529 },
              opacity: 0.53,
            },
          ],
        },
        {
          name: 'Color 2',
          id: '',
          description: '',
          paints: [
            { type: 'SOLID', color: { r: 1, g: 0, b: 0 } },
            {
              type: 'SOLID',
              color: {
                r: 0.13333333333333333,
                g: 0.9372549019607843,
                b: 0.00392156862745098,
              },
              opacity: 0.2,
            },
            {
              type: 'SOLID',
              color: { r: 0.2784313725490196, g: 0.3333333333333333, b: 0.4117647058823529 },
              opacity: 0.53,
            },
          ],
        },
        {
          name: 'Color 3',
          id: '',
          description: '',
          paints: [
            { type: 'SOLID', color: { r: 1, g: 0, b: 0 } },
            {
              type: 'SOLID',
              color: {
                r: 0.13333333333333333,
                g: 0.9372549019607843,
                b: 0.00392156862745098,
              },
              opacity: 0.2,
            },
            {
              type: 'SOLID',
              color: { r: 0.2784313725490196, g: 0.3333333333333333, b: 0.4117647058823529 },
              opacity: 0.53,
            },
            {
              type: 'SOLID',
              color: {
                r: 0.06666666666666667,
                g: 0.5686274509803921,
                b: 0.592156862745098,
              },
              opacity: 0.6,
            },
          ],
        },
      ] as Partial<PaintStyle>[];

      mockGetLocalPaintStyles.mockReturnValue(paintStyles);
      controllers['generate-theme']({ type: ActionTypes.generateTheme });

      expect(mockUiPostMessage).toBeCalledWith({
        meta: {
          'Color 1': '#9d2d37', // this color is rgb(157, 45, 56) the color obtained with Figma' color picker is rgb(157, 45, 55)
          'Color 2': '#884337', // this color is rgb(136, 67, 55) the color obtained with Figma' color picker is rgb(137, 68, 56)
          'Color 3': '#407170', // this color is rgb(64, 113, 112) the color obtained with Figma' color picker is rgb(65, 114, 113)
        },
        type: 'download-file',
      });
    });

    it('should ignore all colours with a NON-SOLID paint layer', () => {
      const paintStyles = [
        {
          name: 'Color 1',
          id: '',
          description: '',
          paints: [
            { type: 'IMAGE', color: { r: 0.1234, g: 0.00123, b: 0.789234 } },
            { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
          ],
        },
        {
          name: 'Color 2',
          id: '',
          description: '',
          paints: [{ type: 'VIDEO', scaleMode: 'FILL', videoHash: '' }],
        },
        {
          name: 'Color 3',
          id: '',
          description: '',
          paints: [
            {
              type: 'GRADIENT_ANGULAR',
              gradientStops: [{ color: { r: 0.1234, g: 0.00123, b: 0.789234 }, position: 1 }],
              gradientTransform: [
                [1, 1, 1],
                [1, 1, 1],
              ],
            },
          ],
        },
      ] as Partial<PaintStyle>[];

      mockGetLocalPaintStyles.mockReturnValue(paintStyles);
      controllers['generate-theme']({ type: ActionTypes.generateTheme });

      expect(mockUiPostMessage).toBeCalledWith({
        meta: {},
        type: 'download-file',
      });
    });
  });

  describe('generate-theme-page', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should not create the page if it already exist', () => {
      mockRootChildren.push({ name: '#Morfeo theme' });

      controllers['generate-theme-page']({ type: ActionTypes.generateThemePage });

      expect(mockCreatePage).not.toBeCalled();
      expect(mockNotify).toBeCalledTimes(1);
      expect(mockNotify).toBeCalledWith(expect.any(String), expect.objectContaining({ error: true }));

      // clean mockRootChildren so it will not affect any other test
      mockRootChildren.length = 0;
    });

    it('should create the page if it does not exist', () => {
      controllers['generate-theme-page']({ type: ActionTypes.generateThemePage });

      expect(mockCreatePage).toBeCalledTimes(1);

      expect(mockNotify).toBeCalledTimes(1);
      expect(mockNotify).toBeCalledWith('Theme page created!');
    });
  });
});
