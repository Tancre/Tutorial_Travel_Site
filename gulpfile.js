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
svgSprite = require('gulp-svg-sprite'),
svg2png = require('gulp-svg2png'),
rename = require('gulp-rename'),
del = require('del'),
webpack = require('webpack-stream'),
webpackConfig = require('./webpack.config.js'),
modernizr = require('gulp-modernizr'),
browserSync = require('browser-sync').create();

// file path variables
const files = {
	scssPath: './app/assets/scss/**/*.scss',
	jsPath: './app/assets/js/**/*.js',
	imgsPath: './app/assets/images/**/*',
	iconsPath: './app/assets/images/icons/**/*.svg',
	spriteCSSPath: './app/temp/sprite/css/*.css',
	spriteGraphicPath: './app/temp/sprite/css/*.svg'
}


// modernizr task
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


// webpack task
function cleanScripts(){
	return del('./dist/scripts/App.js');
}

function scriptsTask(){
	return src('./app/assets/js/App.js')
		.pipe(webpack(webpackConfig, null, function(err, stats) {
      		if (err) { console.log(err); };
    	}))
		// .on('error', function (err) { if(err){ console.log(err.message);} })
		.pipe(dest('./dist/scripts'))
		.pipe(browserSync.stream());
}

// create sprite task
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
	return del(['./app/temp/sprite', './app/assets/images/sprites', 'dist/images/sprite']);
}

function createSpriteTask(){
	return src(files.iconsPath)
		.pipe(svgSprite(config))
		.pipe(dest('app/temp/sprite/'));
}

function createPngCopy(){
	return src('./app/temp/sprite/css/*.svg')
		.pipe(svg2png())
		.pipe(dest('./dist/images/sprite'));
}

function copySpriteGraphic(){
	return src('./app/temp/sprite/css/*.{svg,png}')
		.pipe(dest('./dist/images/sprite'));
}

function copySpriteCSS(){
	return src(files.spriteCSSPath)
		.pipe(rename('_sprite.scss'))
		.pipe(dest('app/assets/scss/modules'));
}

function endClean(){
	return del(['./app/temp']);
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
// function jsTask() {
// 	return src(files.jsPath)
// 		.pipe(concat('all.js'))
// 		//.pipe(uglify())
// 		.pipe(dest('dist'))
// 		.pipe(browserSync.stream());
// }

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
    gulp.watch("./app/assets/js/**/*.js", {usePolling : true}, gulp.series(cleanScripts, modernizrTask, scriptsTask, endCleanModernizr));
    gulp.watch("./app/assets/images", {usePolling : true}, gulp.series(imagesTask));
    gulp.watch("./*.html").on('change', browserSync.reload);
};

// default task
exports.default = series(
	parallel( scssTask, cleanScripts, scriptsTask, createSpriteTask, imagesTask),
	cacheBustTask,
	watch
);

exports.watch = watch;
exports.createSpriteTask = createSpriteTask;
exports.copySpriteCSS = copySpriteCSS;
exports.copySpriteGraphic = copySpriteGraphic;
exports.modernizrTask = modernizrTask;
exports.icons = series(beginClean, createSpriteTask, createPngCopy, copySpriteGraphic, copySpriteCSS, endClean);
exports.scripts = series(cleanScripts, modernizrTask ,scriptsTask);