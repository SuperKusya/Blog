const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');

const htmlmin = require('gulp-htmlmin');
const browserSync = require("browser-sync");
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const del = require('del');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const ghPages = require('gulp-gh-pages-with-updated-gift');
const svgSprite = require('gulp-svg-sprite');

const path = {
    dist: {
        html: 'dist/',
        css: 'dist/',
        js: 'dist/js/',
        img: 'dist/img/',
        icons: 'dist/icons/',
        favicon: "dist/favicon"
    },
    src: {
        html: ['src/*.html', 'src/*.ico'],
        scss: 'src/sass/*.+(scss|sass)',
        js: 'src/js/*.js',
        img: 'src/img/**/*.*',
        icons: 'src/icons/**/*.svg',
        favicon: "src/favicon/*.*"
    },
    clean: './dist/',
    deploy: 'dist/**/*'
}

async function clean() {
    return del.sync(path.clean);
}


function html() {
    return src(path.src.html)
        .pipe(
            htmlmin({ 
                collapseWhitespace: true 
            })
        )
        .pipe(dest(path.dist.html)
    );
}

function styles() {
    return src(path.src.scss).pipe(
            sass({
                outputStyle: "compressed"
            }).on("error", sass.logError)
        )
        .pipe(
            rename({
                prefix: "",
                suffix: ".min"
            })
        )
        .pipe(
            autoprefixer({
                cascade: false
            })
        )
        .pipe(
            cleanCSS({
                compatibility: "ie8"
            })
        )
        .pipe(dest(path.dist.css))
        .pipe(browserSync.stream());
}

function svg() {
    return src(path.src.icons)
        .pipe(svgSprite( {
            mode: {
                stack: {
                    sprite: "../sprite.svg"
                }
            },
        })
    )
    .pipe(dest(path.dist.icons));
}


function js() {
    return src(path.src.js)
        .pipe(concat('all.js'))
        .pipe(terser())
        .pipe(dest(path.dist.js)
    );
}

function images() {
    return src(path.src.img).pipe(cache(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ])))
        .pipe(dest(path.dist.img));
}

function favicon() {
    return src(path.src.favicon).pipe(dest(path.dist.favicon));
}

function server() {
    browserSync.init({
        server: {
            baseDir: path.dist.html
        }
    });
}


function look() {
    watch(path.src.scss, parallel(styles));
    watch(path.src.js, parallel(js));
    watch(path.src.html).on("change", series(html, browserSync.reload));
}

function deploy() {
    return src(path.deploy)
        .pipe(ghPages());
}

exports.build = series(clean, parallel(html, styles, images, js, svg, favicon));
exports.default = series(exports.build, parallel(look, server));
exports.deploy = series(exports.build, deploy);