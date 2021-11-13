import ESBuild from 'esbuild'

// Is this a dev build?
let _DEV_ = false
if (process.argv.find((arg) => { return arg === 'dev' })) {
  _DEV_ = true
}

// Options
const options = {
  bundle: true,
  outdir: './public',
  entryPoints: [
    './client/UserManagementPage.jsx'
  ],
  sourcemap: _DEV_,
  minify: (!_DEV_),
  define: {
    _VER_: `"${process.env.npm_package_version}"`,
    _DEV_,
    'process.env.NODE_ENV': (_DEV_ ? '"development"' : '"production"')
  }
}

// Build each set of files
async function doBuild () {
  try {
    await ESBuild.build(options)
  } catch {
    process.exit(1)
  }
}
doBuild()
