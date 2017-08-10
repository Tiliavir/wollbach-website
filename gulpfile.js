"use strict";
exports.__esModule = true;
var fs = require("fs");
var gulp = require("gulp");
var moment = require("moment");
var marked = require("marked");
var path = require("path");
var yargs = require("yargs");
var gulpLoadPlugins = require("gulp-load-plugins");
var mvw_navigation_1 = require("mvw-navigation");
var isRelease = yargs["default"]("release", false).boolean("release").argv.release;
var baseUrl = isRelease ? "http://www.wollbach.info/" : "http://localhost/";
var navigation;
var $ = gulpLoadPlugins();
var logger = require("gulplog");
var paths = {
    dest: "./build/"
};
var getScope = function (file) {
    var filename = path.basename(file.path, path.extname(file.path));
    return {
        marked: marked,
        moment: moment,
        require: require,
        isRelease: isRelease,
        scope: {
            siteTitle: "Wollbach",
            baseUrl: baseUrl
        },
        referencedFile: filename,
        breadcrumb: filename === "index" ? null : navigation.getBreadcrumb(filename, true)
    };
};
gulp.task("sitemap", function () {
    return gulp.src([paths.dest + "**/*.html", "!**/401.html", "!**/google*"], {
        read: false
    })
        .pipe($.sitemap({
        siteUrl: baseUrl,
        changefreq: "monthly"
    }))
        .pipe(gulp.dest(paths.dest));
});
gulp.task("lint:pug", function () {
    var PugLint = require("pug-lint");
    var linter = new PugLint();
    linter.configure({ "extends": __dirname + "\\\.pug-lint.json" });
    return gulp.src("./partials/pages/**/*.pug")
        .pipe($.data(function (f) {
        for (var _i = 0, _a = linter.checkPath(f.path); _i < _a.length; _i++) {
            var error = _a[_i];
            logger.warn(error.msg + ": " + error.filename + " " + error.line + ":" + (error.column || 0));
        }
    }));
});
gulp.task("html:writeNavigation", function (done) {
    navigation = new mvw_navigation_1.Navigation(require("./partials/site-structure.json"), "html", {
        referencedFile: "index",
        title: "Startseite"
    });
    fs.writeFileSync("./partials/siteOverviewList.pug", navigation.writeNavigation("allplain"));
    fs.writeFileSync("./partials/topnavigation.pug", navigation.writeNavigation("top"));
    fs.writeFileSync("./partials/footernavigation.pug", navigation.writeNavigation("footer"));
    return done();
});
gulp.task("html:generatePages", function () {
    return gulp.src("./partials/pages/**/*.pug")
        .pipe($.replace(/^(\s*#+) /gm, "$1# "))
        .pipe($.rename(function (path) { path.ext = ".html"; }))
        .pipe($.data(getScope))
        .pipe($.data(function (f) { return logger.info("  Starting " + f.relative); }))
        .pipe($.pug())
        .pipe($.data(function (f) { return logger.info("√ Finished " + f.relative); }))
        .pipe($.flatten())
        .pipe(gulp.dest(paths.dest));
});
gulp.task("html:minify", function () {
    return gulp.src(paths.dest + "**/*.html")
        .pipe($.htmlmin({
        sortAttributes: true,
        removeComments: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeAttributeQuotes: true,
        conservativeCollapse: true,
        minifyJS: true,
        minifyCSS: true
    }))
        .pipe(gulp.dest(paths.dest));
});
gulp.task("default", gulp.series("html:writeNavigation", "html:generatePages"));
gulp.task("release", gulp.series("html:writeNavigation", "html:generatePages", "sitemap", "html:minify"));
