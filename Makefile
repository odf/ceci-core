BUILD=./build


all:	$(BUILD)/index.js
	$(MAKE) -C src && \
	$(MAKE) -C spec

clean:
	$(MAKE) -C src clean && \
	$(MAKE) -C spec clean

distclean:
	rm -f $(BUILD)/index.js && \
	$(MAKE) -C src distclean && \
	$(MAKE) -C spec distclean

test:	all
	./node_modules/.bin/jasmine-node build

$(BUILD)/index.js:	es6.js
	cat ./node_modules/regenerator/runtime/min.js $^ >$@
