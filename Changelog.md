## 2.0.0

- Breaking change: removed `context.cube()` API (`src/context/apiCube.js`)
- Breaking change: removed `context.gangliaWeb()` API (`src/context/apiGangliaWeb.js`)
- Breaking change: removed Librato integration (`src/librato/*` and `context.librato()`)
- Bumped package version to `2.0.0` to reflect API surface removals

## 1.1.3

- Upgrade to d3 v7
- fix the timeline for the stock chart

## 1.4.0

- Update packages
- Change name
- Rewrite how the rendering of horizon is done to be simplier to understand and faster

## 1.4.1

- Update packages
- Performance updates by avoiding extent() scans and allowing cancelled timers to be properly cancelled
