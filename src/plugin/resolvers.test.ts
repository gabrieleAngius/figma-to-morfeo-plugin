import {
  mockGetLocalPaintStyles,
  mockUiPostMessage,
} from "../../__mocks__/figmaMock";
import { ActionTypes } from "../_shared/types/actions";
import { resolvers } from "./resolvers";

describe("resolvers", () => {
  describe("generate theme", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should send an empty meta if there are no valid colors", () => {
      resolvers["generate-theme"]({ type: ActionTypes.generateTheme });

      expect(mockUiPostMessage).toBeCalledWith({
        meta: {},
        type: "download-file",
      });
    });

    it("should generate the theme and send a message with meta to the UI", () => {
      const paintStyles = [
        {
          name: "Color 1",
          id: "",
          description: "",
          paints: [{ type: "SOLID", color: { r: 1, g: 2, b: 3 } }],
        },
        {
          name: "Color 2",
          id: "",
          description: "",
          paints: [
            { type: "SOLID", color: { r: 10, g: 12, b: 13 }, opacity: 0.6 },
          ],
        },
      ] as Partial<PaintStyle>[];

      mockGetLocalPaintStyles.mockReturnValue(paintStyles);
      resolvers["generate-theme"]({ type: ActionTypes.generateTheme });

      expect(mockUiPostMessage).toBeCalledWith({
        meta: {
          "Color 1": "rgba(1,2,3,1)",
          "Color 2": "rgba(10,12,13,0.6)",
        },
        type: "download-file",
      });
    });

    it("should ignore non-SOLID colours", () => {
      const paintStyles = [
        {
          name: "Color 1",
          id: "",
          description: "",
          paints: [{ type: "IMAGE", color: { r: 1, g: 2, b: 3 } }],
        },
        {
          name: "Color 2",
          id: "",
          description: "",
          paints: [{ type: "VIDEO", scaleMode: "FILL", videoHash: "" }],
        },
        {
          name: "Color 3",
          id: "",
          description: "",
          paints: [
            {
              type: "GRADIENT_ANGULAR",
              gradientStops: [
                { color: { r: 1, g: 1, b: 1, a: 1 }, position: 1 },
              ],
              gradientTransform: [
                [1, 1, 1],
                [1, 1, 1],
              ],
            },
          ],
        },
      ] as Partial<PaintStyle>[];

      mockGetLocalPaintStyles.mockReturnValue(paintStyles);
      resolvers["generate-theme"]({ type: ActionTypes.generateTheme });

      expect(mockUiPostMessage).toBeCalledWith({
        meta: {},
        type: "download-file",
      });
    });
  });
});
