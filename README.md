# Figma to Morfeo

[![codecov](https://codecov.io/gh/gabrieleAngius/figma-to-morfeo/branch/main/graph/badge.svg?token=VJMHSKVPCD)](https://codecov.io/gh/gabrieleAngius/figma-to-morfeo)

## Quickstart

- Run `yarn` to install dependencies.
- Run `yarn build:watch` to start webpack in watch mode.
- Open `Figma` -> `Plugins` -> `Development` -> `Import plugin from manifest...` and choose `manifest.json` file from this repo.

⭐ Figma API documentation on the [Figma API Overview](https://www.figma.com/plugin-docs/api/api-overview/).

## Toolings

This repo is using:

- React + Webpack
- TypeScript
- Prettier precommit hook
- Jest

We also recommend using Commitizen to enhance the experience.

## Trigger a plugin action from UI

The base of this tool is the communication between the UI (react) and the controller (figma plugin)

⭐ To change the UI of the plugin (the react code), you should edit [App.tsx](./src/app/components/App.tsx).

From the react components / hooks is possible to trigger a specific plugin controller. To do so:

```typescript
parent.postMessage({ pluginMessage: { type: ActionTypes.generateTheme } }, '*');
```

The object specified as `pluginMessage` will be received to the [plugin controller](./src/plugin/controller.ts) and will trigger one pluginController based of his ActionType.
So to add a new pluginController:

- create a new [ActionType](./src/_shared/types/actions.ts)
- create a new folder inside `/plugin` with a file named in the same way (and one more test file)
- add the new function on `controllers` map at [controller.ts](./src/plugin/controller.ts)

## Trigger a UI action from the plugin

To send back an action from the plugin to the UI, you can use `figma` global API:

```typescript
figma.ui.postMessage({
  type: ActionTypes.downloadFile,
  meta: normalizedColors,
});
```

The specified object will be received and handled on the UI in this way:

```typescript
React.useEffect(() => {
  window.onmessage = (event) => {
    const { type, meta } = event.data.pluginMessage;
    if (type === ActionTypes.downloadFile) {
      doSomeUiStuff(meta);
    }
  };
}, []);
```

Let's see how to create a new UI action step-by-step:

- create a new [ActionType](./src/_shared/types/actions.ts)
- this new action type will probably be ui-specific (not handled on the plugin), so we should add it to exclusion on [PluginActionType](./src/_shared/types/actions.ts) (we need it to make pluginControllers type-safe)
- add the code on react to receive and handle it (see example above)
