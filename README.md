# cubism-es
cubism-es is an ES6 module of [cubism](https://github.com/square/cubism), based on d3v7.

> **IMPORTANT** Version 1.1.0 contains api breaks. Please see below for details


## Usage:

1. ES6 Usage

```
npm install cubism-es --save
import { context } from 'cubism-es';
```
Please note adding `cubism-es` will automatically add `d3` as a dependency into your project.
From version `1.1.2`, there's no need to declare d3 as globals in your project with the `webpack ProvidePlugin`

2. Standalone Usage

```
<script src="lib/d3.v7.min.js" charset="utf-8" type="application/javascript"></script>
<script src="lib/cubism-es.standalone.js" charset="utf-8" type="application/javascript"></script>
```

## API Breaks (v1.1.0)
function | cubism | cubism-es
--- | --- | ---
**Context.axis** | `d3.select(...).call(context.axis)` | `context.axis().render(d3.select(...))`
**Context.rule** | `d3.select(...).call(context.rule)` | `context.rule().render(d3.select(...))`
**Context.horizon** | `d3.select(...).call(context.horizon)` | `context.horizon().render(d3.select(...))`

## API Breaks (v1.0.0 and previous)
function | cubism | cubism-es
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

## Documentation
For more information, please visit square/cubism's [home page](http://square.github.io/cubism/) and [wiki](https://github.com/square/cubism/wiki)


## Limitation
Graphite, Cube and GangliaWeb have not been verified yet.

## Credits
Contributors of the original [cubism](https://github.com/square/cubism), [Yun Xing](https://github.com/BigFatDog) for the ES6 port, [Matthieu](https://github.com/ekacnet) for the clean-up and the upgrade to d3v7.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details



