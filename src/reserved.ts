/**
 * Source:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/82051f500705ee61a291596fa325734a75bac3c3/types/webpack-env/index.d.ts
 */
export const RESERVED_NAMES_PRESET_WEBPACK = {
  __non_webpack_require__: true,
  __resourceQuery: true,
  __webpack_chunk_load__: true,
  __webpack_hash__: true,
  __webpack_init_sharing__: true,
  __webpack_modules__: true,
  __webpack_nonce__: true,
  __webpack_public_path__: true,
  __webpack_require__: true,
  accept: true,
  active: true,
  addDisposeHandler: true,
  addStatusHandler: true,
  apply: true,
  autoApply: true,
  check: true,
  chunkName: true,
  data: true,
  DEBUG: true,
  decline: true,
  dispose: true,
  exclude: true,
  exports: true,
  ignoreDeclined: true,
  ignoreErrored: true,
  ignoreUnaccepted: true,
  include: true,
  mode: true,
  module: true,
  onAccepted: true,
  onDeclined: true,
  onDisposed: true,
  onErrored: true,
  onUnaccepted: true,
  prefetch: true,
  preload: true,
  recursive: true,
  regExp: true,
  removeDisposeHandler: true,
  removeStatusHandler: true,
  status: true,
  url: true,
  webpack: true,
  webpackContext: true,
  webpackHot: true,
} as const;

export const RESERVED_NAMES_PRESET_CJS = {
  exports: true,
} as const;

/**
 * Source:
 * https://github.com/acornjs/acorn/blob/a707bfefd73515efd759b7638c30281d775cd043/acorn/src/identifier.js#L16
 */
export const RESERVED_NAMES_PRESET_ACORN = {
  abstract: true,
  arguments: true,
  boolean: true,
  byte: true,
  char: true,
  class: true,
  const: true,
  double: true,
  enum: true,
  eval: true,
  export: true,
  extends: true,
  final: true,
  float: true,
  goto: true,
  implements: true,
  import: true,
  int: true,
  interface: true,
  let: true,
  long: true,
  module: true,
  native: true,
  package: true,
  private: true,
  protected: true,
  public: true,
  short: true,
  static: true,
  super: true,
  synchronized: true,
  throws: true,
  transient: true,
  volatile: true,
  yield: true,
} as const;

export const RESERVED_NAMES_PRESET_ALL = {
  ...RESERVED_NAMES_PRESET_WEBPACK,
  ...RESERVED_NAMES_PRESET_CJS,
  ...RESERVED_NAMES_PRESET_ACORN,
} as const;