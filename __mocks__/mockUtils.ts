export const mockNode = <T extends BaseNode>(overrides?: Partial<T>) => {
  return {
    id: `${Math.random()}`,
    appendChild: jest.fn(),
    setSharedPluginData: jest.fn(),
    getSharedPluginData: jest.fn(),
    ...overrides,
  } as unknown as T;
};
