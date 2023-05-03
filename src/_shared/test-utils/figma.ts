export const mockPostMessage = () => {
  const postMessageMocked = jest.fn();
  jest.spyOn(figma.ui, 'postMessage').mockImplementation(postMessageMocked);
  return postMessageMocked;
};
