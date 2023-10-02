release:
	@echo "Building Release v$(VERSION)"
	@echo "v$(VERSION)" > VERSION
	npm run build
	-git commit -am "v$(VERSION)"
	git tag -a -m "v$(VERSION)" v$(VERSION)
	git push origin --tags