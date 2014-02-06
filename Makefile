BUILD=./lib


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
	./node_modules/.bin/jasmine-node lib

$(BUILD)/index.js:	es6.js
	mkdir -p $(BUILD) && \
	cat ./node_modules/regenerator/runtime/min.js $^ >$@
