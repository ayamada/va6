.PHONY: all clean build dist deps demo deploy-demo deploy-npm


CC = closure-compiler
CC_OPTS = --charset UTF-8 --language_out ECMASCRIPT5_STRICT


# TODO: jqはnodeで用意するようにする
VA6_VERSION = $(shell cat package.json|jq .version)




all: build ;


clean:
	-rm -f .*-ok
	-rm -f build/*
	-rm -f dist/va6/*
	-rmdir dist/va6/
	-rm -f dist/*
	-rm -f demo/*



.deps-ok:
	# TODO
	touch .deps-ok


deps: .deps-ok ;


build: .deps-ok
	# TODO


.dist-ok: build
	# TODO
	touch .dist-ok

dist: clean .dist-ok ;


demo:
	# TODO


deploy-demo: dist demo
	ssh m 'bin/drop htdocs.va6.tir.jp/demo/ || true'
	scp -r demo m:htdocs.va6.tir.jp/ || echo 'failed to upload demo'
	@echo 'succeeded to upload demo'



deploy-npm-dry-run: .dist-ok
	npm pack --dry-run


deploy-npm-true: dist
	npm publish


confirm-deploy-npm:
	@echo "Are you ok? [y/N] " && read ans && [ $${ans:-N} = y ]


deploy-npm: confirm-deploy-npm deploy-npm-true ;







