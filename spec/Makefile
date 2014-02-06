BUILD=../lib/spec

.SUFFIXES:	.js .jso

.js.jso:
		../node_modules/.bin/regenerator $^ >$@

all:		core_spec.jso deferred_spec.jso util_spec.jso
		mkdir -p $(BUILD) && \
		cp $^ $(BUILD) && \
		cd $(BUILD) && \
		rename -f 's/\.jso/\.js/' *.jso

clean:
		rm -f *.jso

distclean:	clean
		rm -f $(BUILD)/*.js
