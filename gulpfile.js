// initializa modules
const gulp = require('gulp');
const { src, dest, series, parallel } = require('gulp');
const autoprefixer = require('autoprefixer'),
concat = require('gulp-concat'),
postcss = require('gulp-postcss'),
replace = require('gulp-replace'),
sass = require('gulp-sass'),
sourcemaps = require('gulp-sourcemaps'),
imagemin = require('gulp-imagemin'),
svgSprite = require('gulp-svg-sprite'),
svg2png = require('gulp-svg2png'),
rename = require('gulp-rename'),
del = require('del'),
webpack = require('webpack-stream'),
webpackConfig = require('./webpack.config.js'),
modernizr = require('gulp-modernizr'),
usemin = require('gulp-usemin'),
cssnano = require('gulp-cssnano'),
uglify = require('gulp-uglify'),
rev = require('gulp-rev'),
browserSync = require('browser-sync').create();

// file path variables
const files = {
	scssPath: './app/assets/scss/**/*.scss',
	jsPath: './app/assets/js/**/*.js',
	imgsPath: './app/assets/images/**/*',
	iconsPath: './app/assets/images/icons/**/*.svg',
	spriteCSSPath: './app/assets/temp/sprite/css/*.css',
	spriteGraphicPath: './app/assets/temp/sprite/css/*.svg'
}

// ------------------------------------------------------ copy normalize task
function copyNormalizeTask(){
	return src('./node_modules/normalize.css/normalize.css')
		.pipe(rename('_normalize.scss'))
		.pipe(dest('./app/assets/scss/base'));
}
// ------------------------------------------------------ modernizr task

function modernizrTask(){
	return src(['./app/assets/scss/**/*.scss','./app/assets/js/**/*.js'])
		.pipe(modernizr({
			"options": [
				"setClasses"
			]
		}))
		.pipe(dest('./app/assets/temp'));
}

function endCleanModernizr(){
	return del(['./app/assets/temp']);
}


// ------------------------------------------------------ webpack task

function cleanScripts(){
	return del('./app/temp/scripts/App.js');
}

function scriptsTask(){
	return src('./app/assets/js/App.js')
		.pipe(webpack(webpackConfig, null, function(err, stats) {
      		if (err) { console.log(err); };
    	}))
		// .on('error', function (err) { if(err){ console.log(err.message);} })
		.pipe(dest('./app/temp/scripts'))
		.pipe(browserSync.stream());
}

// ------------------------------------------------------ create sprite task

const config =  {
	shape: {
		spacing: {
			padding: 1
		}
	},
	mode: {
		css: {
			variables: {
				replaceSvgWithPng:function() {
					return function(sprite, render) {
						return render(sprite).split('.svg').join('.png');
					}
				}
			},
			sprite: 'sprite.svg',
			render: {
				css: {
					template:'./gulp/templates/sprite.css'
				}
			}
		}
	}
}

function beginClean(){
	return del(['./app/assets/temp/sprite', './app/assets/images/sprites', 'app/temp/images/sprite']);
}

function createSpriteTask(){
	return src(files.iconsPath)
		.pipe(svgSprite(config))
		.pipe(dest('app/temp/sprite/'));
}

function createPngCopy(){
	return src('./app/temp/sprite/css/*.svg')
		.pipe(svg2png())
		.pipe(dest('./app/assets/images/sprites'));
}

function copySpriteGraphic(){
	return src('./app/temp/sprite/css/*.{svg,png}')
		.pipe(dest('./app/assets/images/sprites'));
}

function copySpriteCSS(){
	return src('./app/temp/sprite/css/*.css')
		.pipe(rename('_sprite.scss'))
		.pipe(dest('app/assets/scss/modules'));
}

function endClean(){
	return del(['./app/assets/temp']);
}

// ------------------------------------------------------ sass task
function scssTask() {
	return src(files.scssPath)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([ autoprefixer()]))
		.pipe(sourcemaps.write('.'))
		.pipe(dest('app/temp/styles'))
		.pipe(browserSync.stream());
}


//BUILD
// ------------------------------------------------------ delete dist folder
function deleteDistFolder(){
	return del('./docs');
}

// ------------------------------------------------------ optimize images task
function imagesTask(){
	return src(['./app/assets/images/**/*','./app/temp/images/**/*', '!./app/assets/images/icons', '!./app/assets/images/icons/**/*'])
		.pipe(imagemin({
			progressive: true,
			interlaced: true,
			multipass: true
		}))
		.pipe(dest('./docs/assets/images'));
}

// ------------------------------------------------------ copy sprite folder
function copySpriteFolder(){
	return src('./app/temp/images/sprite/*')
		.pipe(dest('./docs/assets/images/sprite'));
}

// ------------------------------------------------------ usemin task
function useminTask(){
	return src('./app/index.html')
	.pipe(usemin({
		css: [function(){return rev()}, function(){return cssnano()}],
		js: [function(){return rev()}]
	}))
		.pipe(dest('./docs'));
}

//.------------------------------------------------------- copy general files
function copyGeneralFiles(){
	var pathsToCopy = [
		'./app/**/*', 
		'!./app/index.html',
		'!./app/assets/images/**',
		'!./app/assets/js/**',
		'!./app/assets/scss/**',
		'!./app/temp',
		'!./app/temp/**'
	]

	return src(pathsToCopy)
		.pipe(dest('./docs'));
}

//.------------------------------------------------------- preview dist
function previewDist(){
	browserSync.init({
		notify: false,
    	server: {
    		baseDir: './docs'
    	}
    });
}


//  ------------------------------------------------------ cachebusting task

const cbString = new Date().getTime();

function cacheBustTask() {
	return src(['./docs/index.html'])
		.pipe(replace(/cb=\d+/g, 'cb=' + cbString))
		.pipe(dest('./docs'));
}

//  ------------------------------------------------------ watch task
const watch = function() {
	browserSync.init({
		notify: false,
    	server: {
    		baseDir: './app'
    	}
    });
    gulp.watch("./app/assets/scss/**/*.scss", {usePolling : true}, gulp.series(scssTask));
    gulp.watch("./app/assets/js/**/*.js", {usePolling : true}, gulp.series(cleanScripts, modernizrTask, scriptsTask, endCleanModernizr));
    // gulp.watch("./app/assets/images", {usePolling : true}, gulp.series(imagesTask));
    gulp.watch("./app/*.html").on('change', browserSync.reload);
};


// default task
exports.default = series(
	// parallel( scssTask, cleanScripts, scriptsTask, createSpriteTask, imagesTask),
	// cacheBustTask, 
	watch
);

exports.watch = watch;
const styles = scssTask;
const scripts = series(cleanScripts, modernizrTask, scriptsTask, endCleanModernizr)
const icons = series(beginClean, createSpriteTask, createPngCopy, copySpriteGraphic, copySpriteCSS, endClean);
exports.copyNormalizerTask = copyNormalizeTask;
exports.build = series(deleteDistFolder, icons, copySpriteFolder, styles, scripts, imagesTask, copyGeneralFiles, useminTask, cacheBustTask);
exports.previewDist = previewDist;