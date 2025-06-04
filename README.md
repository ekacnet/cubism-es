# cubism-ng
[![codecov](https://codecov.io/gh/ekacnet/cubism-es/graph/badge.svg?token=P3QB0BZKKA)](https://codecov.io/gh/ekacnet/cubism-es)
[![actions](https://github.com/ekacnet/cubism-es/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ekacnet/cubism-es/actions)

cubism-ng is an ES6 module of [cubism](https://github.com/square/cubism), based on d3v7.

> **IMPORTANT** Version 1.1.0 contains api breaks. Please see below for details


## Usage:

1. ES6 Usage

```
npm install cubism-ng --save --force --ignore-scripts
import { context } from 'cubism-ng';
```
Please note adding `cubism-ng` will automatically add `d3` as a dependency into your project.
From version `1.1.2`, there's no need to declare d3 as globals in your project with the `webpack ProvidePlugin`

2. Standalone Usage

```
<script src="lib/d3.v7.min.js" charset="utf-8" type="application/javascript"></script>
<script src="lib/cubism-ng.standalone.js" charset="utf-8" type="application/javascript"></script>
```

## API Breaks (v1.1.0)
function | cubism | cubism-ng
--- | --- | ---
**Context.axis** | `d3.select(...).call(context.axis)` | `context.axis().render(d3.select(...))`
**Context.rule** | `d3.select(...).call(context.rule)` | `context.rule().render(d3.select(...))`
**Context.horizon** | `d3.select(...).call(context.horizon)` | `context.horizon().render(d3.select(...))`

## API Breaks (v1.0.0 and previous)
function | cubism | cubism-ng
--- | --- | ---
**Context** | `d3.select(...).call(cubism.context)` | `const context = cubism.context(d3.select(...)).height(30)`
**Context.axis** | `d3.select(...).call(context.axis)` | `context.axis(d3.select(...))`
**Context.rule** | `d3.select(...).call(context.rule)` | `context.rule(d3.select(...))`
**Context.horizon** | `d3.select(...).call(context.horizon)` | `context.horizon(d3.select(...))`


## Demo
the following samples work, you can try them by downloading this project and running `npm install` and `npm run dev`:

* Matthieu's adaptation for ES6 & d3v7 of Mike's [random demo](https://ekacnet.github.io/cubism-es/random.html)
* Matthieu's adaptation for ES6 & d3v7 of Mike's [stock demo](https://ekacnet.github.io/cubism-es/stock.html)
* Mike, Bostock's [stock demo](https://bost.ocks.org/mike/cubism/intro/demo-stocks.html)
* Patrick, Thompson's [Discrete Cubism](http://bl.ocks.org/patrickthompson/4d508eb3b8feac90762e)
* Square Inc's [demo](http://square.github.io/cubism/)
* Mike, Bostock's [random demo](https://bost.ocks.org/mike/cubism/intro/demo-random.html)

## Development
1. Clone repository
2. Run commands
```
npm install         // install dependencies
npm run dev         // view demos in web browser at localhost:3004
npm run build       // build
npm run test        // run tests only
npm run test:cover  // run tests and view coverage report
```

### About vscode
It seems that everybody (almost) is using vscode those days, I'm not (I'm using VIM) but in case you want to use it and do debug here is a config that worked for `launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch stock.html",
            "type": "firefox",
            "request": "launch",
            "reAttach": true,
            "url": "http://localhost:3004/stock.html",
            "webRoot": "${workspaceFolder}",
            "tmpDir": "${HOME}/Work/tmp",
            "pathMappings": [
                {
                    "url": "http://localhost:3004/stock.html",
                    "path": "${workspaceFolder}/demo/stock.html"
                }
            ]
        }
    ]
}
```

### About the main and the master branches

In git repositories, main or master are usually considered root branch but you usually have just one of them (either `main` or `master`) not both.

So why 2 here ?, as of Mayu 2024 I (Matthieu) still have hope to get in touch with the original maintainer of `cubism-ng` and that's why I maintain a stack of diff against his root branch: `master` but that starts to be annoying when you want to use a more up to date and maintained version, that's why I created the `main` branch with what I think is a stable version of the code.

## Documentation
For more information, please visit square/cubism's [home page](http://square.github.io/cubism/) and [wiki](https://github.com/square/cubism/wiki), this version should support the same API.

Starting from `1.2.0` there is a new `zoom` api for `context`, as the name implies it allows to zoom on the horizon(s).
In order to do so add something like this:

```javascript
    const z = d3.select("body").append("div")
        .attr("class", "zoom");

    context.zoom(function(start, end) {
        console.log(`Doing a zoom from point ${start} to point ${end}`);
        context.zoom().zoomTime(start, end);
    }).render(z);
```

The core of the configuration is the function that you pass to `zoom()`, it takes 2 parameters: the start index and the end index of the zoom, it's not time based but pixel based.

You can do pretty much anything you want in the zoom function like actually zooming or calling a different URL with a detailed analysis of the zoom time.
There is a function in the `zoom` module that you can reuse for doing the actual zooming: `zoom().zoomTime()`, your source must be able to provide a fresh array of values to handle the zoom, see examples in the stock or random demo.

Zoom also support a zoom style or zoom type, the default one is drawing a rectangle from the point where you click and to the point where you are moving your mouse, `onelane` will start at the top of the horizon that has been clicked and will go to the bottom of this horizon; `full` will start at the top of the whole `cubism` graph till the bottom of it.


## Limitation
Graphite, Cube and GangliaWeb have not been verified yet.

## Credits
Contributors of the original [cubism](https://github.com/square/cubism), [Yun Xing](https://github.com/BigFatDog) for the ES6 port, [Matthieu](https://github.com/ekacnet) for the clean-up and the upgrade to d3v7.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details



