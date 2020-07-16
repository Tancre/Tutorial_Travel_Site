const gulp = require('gulp'),
imagemin = require('gulp-imagemin');

function imagesTask(){
	return src(files.imgsPath)
		.pipe(imagemin())
		.pipe(dest('dist/images'));
}