const gulp = require('gulp'),
sass = require('gulp-sass'),
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
cssnano = require('cssnano');

function scssTask() {
	return src(files.scssPath)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([ autoprefixer(), cssnano() ]))
		.pipe(sourcemaps.write('.'))
		.pipe(dest('dist'))
		.pipe(browserSync.stream());
}