# <svg width="32" height="30" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="64" height="64" fill="transparent"/> <path d="M18 10L10 18V46L18 54" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/> <path d="M46 10L54 18V46L46 54" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/> <path d="M24 22L40 22L24 42L40 42" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/> </svg> Json2Zod

[![npm version](https://img.shields.io/npm/v/json2zod?logo=npm)](https://www.npmjs.com/package/json2zod)
[![npm downloads](https://img.shields.io/npm/dm/json2zod?logo=npm)](https://www.npmjs.com/package/json2zod)
[![license](https://img.shields.io/npm/l/json2zod.svg)](https://github.com/YOUR-USERNAME/json2zod/blob/main/LICENSE)


A CLI tool and library to convert JSON structures into [Zod](https://zod.dev) schemas — **with optional `.openapi({ example })` generation**, perfect for tools like:

- [`zod-openapi`](https://www.npmjs.com/package/zod-openapi)
- [`@asteasolutions/zod-to-openapi`](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi)
- [`@anatine/zod-openapi`](https://www.npmjs.com/package/@anatine/zod-openapi)

This feature saves significant time when transforming example JSON data into Zod + OpenAPI-compatible schemas.

---

## Table of Contents

- [Features](#features)
- [Output Example](#output-example)
- [Browser Usage](#browser-usage)
- [Installation](#installation)
- [CLI Usage](#cli-usage)
  - [Passing JSON as an Argument](#passing-json-as-an-argument)
  - [Piping JSON from a File or Stdin](#piping-json-from-a-file-or-stdin)
  - [Including OpenAPI Examples](#including-openapi-examples)
  - [Help Message](#help-message)
- [Programmatic Usage](#programmatic-usage)
- [Development](#development)
- [License](#license)

---

## Features

- ✅ **Automatic Zod Schema Generation** — Infers types like `z.string()`, `z.number()`, `z.boolean()`, `z.null()`, `z.object()`, and `z.array()` from any JSON.
- 🔁 **Recursive Type Inference** — Handles deeply nested structures.
- 📦 **Optional OpenAPI Examples** — Add `.openapi({ example })` metadata with a flag or programmatically.
- 💻 **CLI Tool** — Generate schemas from the command line via JSON input or piping.
- 📚 **Library/API** — Use the core logic in your JS/TS apps.

---

## Output Example

### Input JSON

```json
{
  "name": "Jane",
  "age": 25,
  "tags": ["developer", "typescript"],
  "settings": {
    "darkMode": true
  }
}
````

### Output (Zod Schema)

```ts
export const schema = z.object({
  name: z.string(),
  age: z.number(),
  tags: z.array(z.string()),
  settings: z.object({
    darkMode: z.boolean()
  })
});
```

### Output with OpenAPI Examples

Using the `--add-openapi-examples` flag or `{ addOpenApiExamples: true }` programmatically:

```ts
export const schema = z.object({
  name: z.string().openapi({ example: "Jane" }),
  age: z.number().openapi({ example: 25 }),
  tags: z.array(z.string().openapi({ example: "developer" })).openapi({ example: ["developer", "typescript"] }),
  settings: z.object({
    darkMode: z.boolean().openapi({ example: true })
  }).openapi({ example: { darkMode: true } })
});
```

---

## Browser Usage

You can also use `json2zod` directly in your browser via the live playground:

🌐 **[json2zod.pages.dev](https://json2zod.pages.dev/)**

No installation needed — paste your JSON, configure options, and get your Zod schema instantly!

---

## Installation

Install the package via npm:

```bash
npm install json2zod
# or globally
npm -g install json2zod
````

Or with your favorite package manager:

```bash
pnpm add json2zod
# or
bun add json2zod
```

---

## CLI Usage

After installing globally or using `npx`:

```bash
npx json2zod '{"example": "json"}'
```

Or use directly from your project scripts.

### Passing JSON as an Argument

For quick conversions:

```bash
json2zod '{"name": "Alice", "age": 30, "address": {"city": "New York"}}'
```

### Piping JSON from a File or Stdin

From a file:

```bash
cat data.json | json2zod
```

From stdin:

```bash
echo '{"item": "Book", "id": 123}' | json2zod
```

### Including OpenAPI Examples

Add `.openapi({ example })` metadata for each field:

```bash
cat your_data.json | json2zod --add-openapi-examples
```

This is useful for OpenAPI tools like:

* [zod-openapi](https://www.npmjs.com/package/zod-openapi)
* [@asteasolutions/zod-to-openapi](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi)
* [@anatine/zod-openapi](https://www.npmjs.com/package/@anatine/zod-openapi)

### Help Message

Display usage and available flags:

```bash
json2zod --help
```

---

## Programmatic Usage

You can import the schema generator directly in your JS/TS project:

```ts
import { generateZodSchema } from 'json2zod';

const json = {
  name: "Jane",
  age: 25,
  tags: ["developer", "typescript"],
  settings: {
    darkMode: true
  }
};

// Without OpenAPI examples
console.log(generateZodSchema(json));

// With OpenAPI examples
console.log(generateZodSchema(json, { addOpenApiExamples: true }));
```

Supports arrays too:

```ts
const input = [
  { id: 1, title: "First" },
  { id: 2, title: "Second" }
];

console.log(generateZodSchema(input));
```


---

## Development

To contribute:

```bash
git clone https://github.com/Drarox/json2zod.git
cd json2zod
npm install
npm run build
```

---

## License

MIT License — see the [LICENSE](https://github.com/Drarox/json2zod/blob/master/LICENSE) file for details.
