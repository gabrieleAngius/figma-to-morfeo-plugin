export const mockPageNode = (overrides?: Partial<PageNode>) => {
  return {
    id: `${Math.random()}`,
    appendChild: jest.fn(),
    setSharedPluginData: jest.fn(),
    getSharedPluginData: jest.fn(),
    ...overrides,
  } as PageNode;
};
