BUILD=../lib/src

.SUFFIXES:	.js .jso

.js.jso:
		../node_modules/.bin/regenerator $^ >$@

all:		defer.jso core.jso util.jso
		mkdir -p $(BUILD) && \
		cp $^ $(BUILD) && \
		cd $(BUILD) && \
		rename -f 's/\.jso/\.js/' *.jso

clean:
		rm -f *.jso

distclean:	clean
		rm -f $(BUILD)/*.js
