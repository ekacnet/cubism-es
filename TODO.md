~~* Fix display so that we don't NaN when there is no value it's not really adding much value.~~
~~* Add a way to disable keypress~~
* Most of d3 is still included because all the d3 submodules are not marked as external in `rollup`
* Properly record all the timeouts so that `stop()` actually stopping everything
