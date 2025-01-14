# Next.js + obfuscator-webpack-plugin

This is a basic [Next.js](https://nextjs.org) project, bootstrapped with
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
which demonstrates how to use the
[obfuscator-webpack-plugin](https://github.com/ertgl/obfuscator-webpack-plugin)
to obfuscate the code of a Next.js application.

## Configuration

The [`next.config.ts`](./next.config.ts) file overrides the default
webpack configuration for enabling the obfuscator plugin.

## Getting started

First, install the dependencies:

```bash
yarn
```

Then, run the build script:

```bash
yarn build
```

Now the [`.next/server`](./.next/server) and [`.next/static`](./.next/static)
directories should contain the obfuscated assets.

To run the application, start the Next.js server with the following
command:

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see
if the application is running correctly. You should see the
text "**It works!**" rendered in the page.

You can also run the following command to test it programmatically:

```bash
yarn test
```

## Known issues

- In development mode, space characters in the text are rendered as `\x20`.
  To solve this issue, you can either try to configure the obfuscator to work
  with the Next.js development server or disable the obfuscator plugin in
  development mode entirely.
