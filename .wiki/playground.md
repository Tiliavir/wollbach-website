# Test: Simple playground

gulpfile.js:
```js
"use strict";
var moment = require("moment");
var gulp = require("gulp");
var pug = require('gulp-pug');

gulp.task("default", function () {
    return gulp.src("./*.pug")
        .pipe(pug({"locals":{"moment": moment}}))
        .pipe(gulp.dest("./comp/"));
});
```

package.json
```json
{
  "name": "playground",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "gulp": "^3.9.1",
    "gulp-pug": "^3.3.0",
    "moment": "^2.17.1"
  }
}
```