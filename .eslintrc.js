module.exports = {
  parser: "babel-eslint",
  env: {
    commonjs: true,
    es2020: true,
    node: true,
  },
  extends: "eslint:recommended",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {},
};
