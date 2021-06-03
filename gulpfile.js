'use strict';

const gulp = require('gulp'),
    browserSync = require('browser-sync').create();

const config = {
    bsync: {
        proxy: {
            target: `http://127.0.0.1:3333`,
        },
        open: false,
        files: [
            `/app/**/*.*`,
            `/config/**/*.*`,
            `/database/**/*.*`,
            `/public/**/*.*`,
            `/resources/views/**/*.*`,
            `/start/**/*.*`,
            `/.env`
        ]
    }
}

gulp.task('watch', function(done) {

    browserSync.init(config.bsync);

    done();
});