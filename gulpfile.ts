﻿import * as fs from "fs";
import * as File from "vinyl";
import * as gulp from "gulp";
import * as moment from "moment";
import * as marked from "marked"
import * as path from "path";
import * as yargs from "yargs";
import * as gulpLoadPlugins from "gulp-load-plugins";
import { Navigation } from "mvw-navigation";

let isRelease: boolean = yargs.default("release", false).boolean("release").argv.release;
let baseUrl = isRelease ? "http://www.wollbach.info/" : "http://localhost/";
let navigation: Navigation;
let $: any = gulpLoadPlugins();

const paths: {dest: string} = {
  dest: "./build/",
};

var getScope = (file: File) => {
  var filename = path.basename(file.path, path.extname(file.path));
  return {
    marked: marked,
    moment: moment,
    require: require,

    isRelease: isRelease,
    scope: {
      siteTitle: "Wollbach",
      baseUrl: baseUrl,
    },

    referencedFile: filename,
    breadcrumb: filename === "index" ? null : navigation.getBreadcrumb(filename, true)
  };
};

gulp.task("sitemap", () => {
    return gulp.src([paths.dest + "**/*.html", "!**/401.html"], {
                  read: false
                })
               .pipe($.sitemap({
                 siteUrl: baseUrl,
                 changefreq: "monthly"
               }))
               .pipe(gulp.dest(paths.dest));
});

gulp.task("html:writeNavigation", (done) => {
  navigation = new Navigation(require("./partials/site-structure.json"),
                              "html",
                              {
                                referencedFile: "index",
                                title: "Startseite"
                              });
  fs.writeFileSync("./partials/siteOverviewList.pug", navigation.writeNavigation("allplain"));
  fs.writeFileSync("./partials/topnavigation.pug", navigation.writeNavigation("top"));
  fs.writeFileSync("./partials/footernavigation.pug", navigation.writeNavigation("footer"));
  return done();
});

gulp.task("html:generatePages", () => {
  return gulp.src("./partials/pages/**/*.pug")
              .pipe($.replace(/^(\s*#+) /gm, "$1# "))
              .pipe($.rename((path: path.ParsedPath): void => { path.ext = ".html"; }))
              .pipe($.grayMatter())
              .pipe($.data(getScope))
              .pipe($.pug())
              .pipe($.flatten())
              .pipe(gulp.dest(paths.dest));
});

gulp.task("html:minify", () => {
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
