"use strict";
var fs = require("fs");
var gulp = require("gulp");
var moment = require("moment");
var marked = require("marked");
var path = require("path");
var gulpLoadPlugins = require("gulp-load-plugins");
var mvw_navigation_1 = require("mvw-navigation");
var mvw_search_index_1 = require("mvw-search-index");
var isRelease = false;
var baseUrl = isRelease ? "http://www.wollbach.info/" : "http://localhost/";
var navigation;
var searchIndex = new mvw_search_index_1.SearchIndex();
var $ = gulpLoadPlugins();
var paths = {
    dest: "./build/"
};
gulp.task("sitemap", function () {
    return gulp.src([paths.dest + "**/*.html", "!**/401.html"], {
        read: false
    })
        .pipe($.sitemap({
        siteUrl: baseUrl,
        changefreq: "monthly"
    }))
        .pipe(gulp.dest(paths.dest));
});
gulp.task("html:writeNavigation", function () {
    navigation = new mvw_navigation_1.Navigation(require("./partials/site-structure.json"));
    fs.writeFileSync("./partials/siteOverviewList.pug", navigation.writeNavigation("allplain"));
    fs.writeFileSync("./partials/topnavigation.pug", navigation.writeNavigation("top"));
    fs.writeFileSync("./partials/footernavigation.pug", navigation.writeNavigation("footer"));
});
gulp.task("html:generatePages", ["html:writeNavigation"], function () {
    var scope = {
        siteTitle: "Wollbach",
        baseUrl: baseUrl
    };
    var getScope = function (file) {
        var filename = path.basename(file.path, path.extname(file.path));
        return {
            marked: marked,
            moment: moment,
            require: require,
            isRelease: isRelease,
            scope: scope,
            referencedFile: filename,
            breadcrumb: filename === "index" ? null : navigation.getBreadcrumb(filename, true)
        };
    };
    return gulp.src("./partials/pages/**/*.pug")
        .pipe($.replace(/^(\s*#+) /gm, "$1# "))
        .pipe($.rename(function (path) { path.ext = ".html"; }))
        .pipe($.grayMatter())
        .pipe($.data(getScope))
        .pipe($.data(function (file) { return searchIndex.add(file, file.data); }))
        .pipe($.pug())
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
gulp.task("search:index", function () {
    fs.writeFileSync(paths.dest + "index.json", JSON.stringify(searchIndex.getResult()));
});
gulp.task("default", ["html:generatePages"]);
gulp.task("release", $.sequence("html:generatePages", "sitemap", "html:minify", "search:index"));
