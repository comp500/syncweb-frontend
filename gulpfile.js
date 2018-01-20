/* eslint-env node */
const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const iife = require("gulp-iife");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass");

gulp.task("default", ["js", "jsminified", "static", "sass"]);

gulp.task("js", function () {
	return gulp.src(["src/js/players/**/*", "src/js/UIProxy.js", "src/js/index.js"])
		.pipe(sourcemaps.init())
		.pipe(concat("syncweb-frontend.js"))
		.pipe(babel())
		.pipe(iife({ useStrict: false, prependSemicolon: false }))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/js"));
});

gulp.task("jsminified", function () {
	return gulp.src(["src/js/players/**/*", "src/js/UIProxy.js", "src/js/index.js"])
		.pipe(sourcemaps.init())
		.pipe(concat("syncweb-frontend.min.js"))
		.pipe(babel())
		.pipe(iife({ useStrict: false, prependSemicolon: false }))
		.pipe(uglify())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/js"));
});

gulp.task("static", function () {
	return gulp.src("src/static/**/*")
		.pipe(gulp.dest("dist"));
});

gulp.task("sass", function () {
	return gulp.src("src/sass/styles.scss")
		.pipe(sourcemaps.init())
		.pipe(sass().on("error", sass.logError))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/css"));
});

gulp.task("watch", function () {
	gulp.watch("src/sass/**/*", ["sass"]);
	gulp.watch("src/static/**/*", ["static"]);
	gulp.watch("src/js/**/*", ["js"]);
});