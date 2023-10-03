VERSION := $(shell cat VERSION)

build:
	@echo "Building Release v$(VERSION)"
	npm run build

release:
	git tag -a -m "v$(VERSION)" v$(VERSION)
	git push origin --tags


