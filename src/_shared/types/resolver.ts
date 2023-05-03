import { PluginMessage } from './actions';

export type Resolver = (msg: PluginMessage) => void;
