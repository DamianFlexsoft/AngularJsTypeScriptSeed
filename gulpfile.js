/**
 * Created by Damian on 05/02/2016.
 */
'use strict';

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var size = require('gulp-size');
var typescript = require('gulp-typescript');
var eventStream = require('event-stream');
var concatSourceMaps = require('gulp-concat-sourcemap');

var del = require('del');

var config = {
    stylesDir: 'styles/**/*.scss',
    outputDestDir: 'build',
    srcDir: 'app',
    srcTSDir:'app/**/*.ts',
    outDefPath: 'build/definitions',
    bundledJs: "output.js"
};

gulp.task('sass', function() {
    return gulp.src(config.stylesDir)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.destDir))
        .pipe(size());
});

gulp.task('clean', function (cb) {
    del([config.destDir + '/*.*'], cb);
});

gulp.task('compile:ts', function() {
    var tsProject = typescript.createProject({
        target: 'ES5',
        declarationFiles: true,
        noExternalResolve: false,
        sortOutput: true
    });

    var result = gulp.src(config.srcTSDir)
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject, undefined, typescript.reporter.fullReporter(true)));

    return eventStream.merge(
        result.dts.pipe(gulp.dest(config.outDefPath)),
        result.js
            .pipe(concatSourceMaps(config.bundledJs))
            .pipe(sourcemaps.write()) // sourcemaps are added to the .js file
            .pipe(gulp.dest(config.outputDestDir))
    );
});

gulp.task('html', ['styles', 'compile:ts'], function () {
    return gulp.src('app/*.html')
        .pipe($.useref.assets())
        .pipe($.if('**/*.js', $.uglify()))
        .pipe($.if('**/*.css', $.csso()))
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});