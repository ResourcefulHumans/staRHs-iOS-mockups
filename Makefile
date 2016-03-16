.PHONY: build

build: build/css/styles.css build/js/bootstrap.js build/*.html

build/js:
	mkdir -p build/js

build/js/bootstrap.js: package.json js/bootstrap.js
	./node_modules/.bin/browserify js/bootstrap.js -o $@

build/css:
	mkdir -p build/css

build/css/styles.css: scss/*.scss build/fonts
	./node_modules/.bin/node-sass scss/styles.scss $@

build/fonts: node_modules/material-design-icons/iconfont/MaterialIcons-Regular.*
	mkdir -p build/fonts
	cp node_modules/material-design-icons/iconfont/MaterialIcons-Regular.* build/fonts/

build/*.html: *.html includes/*.html util/build-views.js
	mkdir -p build/view/directive
	node util/build-views.js -s ./ -t ./build
