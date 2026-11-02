# The tag-check CLI checks only explicitly configured script sources

The CLI reads `includes` from `biome-plugin-suitescript.json` (or command-line globs) and refuses to run without one. It does not auto-detect files from SDF `deploy.xml`, because transpiled projects deploy generated output while the authored sources live elsewhere, and plain projects deploy non-script files too. Auto-detection would silently check the wrong files; an explicit list is the only universal answer.
