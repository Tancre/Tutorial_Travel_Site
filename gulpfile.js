// initializa modules
const gulp = require('gulp');
const { src, dest, series, parallel } = require('gulp');
const autoprefixer = require('autoprefixer'),
cssnano = require('cssnano'),
concat = require('gulp-concat'),
postcss = require('gulp-postcss'),
replace = require('gulp-replace'),
sass = require('gulp-sass'),
sourcemaps = require('gulp-sourcemaps'),
uglify = require('gulp-uglify'),
imagemin = require('gulp-imagemin'),
browserSync = require('browser-sync').create();

// file path variables
const files = {
	scssPath: './app/assets/scss/**/*.scss',
	jsPath: './app/assets/js/**/*.js',
	imgsPath: './app/assets/images/**/*'
}

// optimize images task
function imagesTask(){
	return src(files.imgsPath)
		.pipe(imagemin())
		.pipe(dest('dist/images'));
}

// sass task
function scssTask() {
	return src(files.scssPath)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([ autoprefixer()]))
		.pipe(sourcemaps.write('.'))
		.pipe(dest('dist'))
		.pipe(browserSync.stream());
}

// js task
function jsTask() {
	return src(files.jsPath)
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(dest('dist'));
}

// cachebusting task
const cbString = new Date().getTime();
function cacheBustTask() {
	return src(['index.html'])
		.pipe(replace(/cb=\d+/g, 'cb=' + cbString))
		.pipe(dest('.'));
}

// watch taskP
const watch = function() {
	browserSync.init({
		notify: false,
    	server: {
    		baseDir: './'
    	}
    });
    gulp.watch("./app/assets/scss/**/*.scss", {usePolling : true}, gulp.series(scssTask));
    gulp.watch("./app/assets/js/**/*.js", {usePolling : true}, gulp.series(jsTask));
    gulp.watch("./app/assets/images", {usePolling : true}, gulp.series(imagesTask));
    gulp.watch("./*.html").on('change', browserSync.reload);
};

// default task
exports.default = series(
	parallel( scssTask, jsTask, imagesTask),
	cacheBustTask,
	watch
);

exports.watch = watch;