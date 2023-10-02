# release notes

This action gets a formated version of the commit messages between two commits

## Inputs

### `latest-release-tag`

**Required** The tag for the currently deployed release on production.

### `release-candidate-tag`

**Required** The tag for the release candidate going out to production

## Outputs

### `notes`

The formated release notes comprised of the commit messages.

## Example usage

```
uses: ArizenHQ/release-notes-action@v1.0
with:
  latest-release-tag: '0.1.0'
  release-candidate-tag: '0.2.0'
```
