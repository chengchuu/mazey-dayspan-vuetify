⚠️ Note: The project is a template for npm. Please don't use it directly.

# mazey-dayspan-vuetify

[![npm version][npm-image]][npm-url]
[![l][l-image]][l-url]

[npm-image]: https://img.shields.io/npm/v/mazey-dayspan-vuetify
[npm-url]: https://npmjs.org/package/mazey-dayspan-vuetify
[l-image]: https://img.shields.io/npm/l/mazey-dayspan-vuetify
[l-url]: https://github.com/chengchuu/mazey-dayspan-vuetify

A TypeScript template for publishing npm packages in CJS, ESM, and browser formats.

## Install

Use mazey-dayspan-vuetify via [npm](https://www.npmjs.com/package/mazey-dayspan-vuetify).

```bash
npm install mazey-dayspan-vuetify --save
```

Of course, you can also download this file and serve it yourself. The file locates at the `lib/mazey-dayspan-vuetify.min.js`.

## Usage

Import the package in your application code.

```typescript
import { createGreeting, packageInfo } from "mazey-dayspan-vuetify";

createGreeting("Cheng"); // "Hello, Cheng!"

createGreeting("community", {
  punctuation: ".",
}); // "Hello, community."

packageInfo.name; // "mazey-dayspan-vuetify"
```

## Contributing

### Development Environment

| Dependency | Version  |
| ---------- | -------- |
| Node.js    | v22.21.1 |
| TypeScript | v5.9.3   |

### Scripts

Install Dependencies:

```bash
npm i
```

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Test:

```bash
npm run test
```

Documentation:

```bash
npm run docs
```

Docker:

```bash
docker compose up -d --build
```

Visit: <http://localhost:8080>

## License

This software is released under the terms of the [MIT license](https://github.com/chengchuu/mazey-dayspan-vuetify/blob/main/LICENSE).
