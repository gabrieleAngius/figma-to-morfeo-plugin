import { resolvers } from './resolvers';

figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
  resolvers[msg.type](msg);
};
