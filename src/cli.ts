#!/usr/bin/env node

import { generateZodSchema } from './generator'; // Import the core generator function
import * as path from 'path';

/**
 * Main function for the CLI tool.
 * Reads JSON input, processes arguments, and prints the generated Zod schema.
 */
async function main() {
    const args = process.argv.slice(2);
    let jsonString: string | undefined;
    let addOpenApiExamples = false; // Default behavior changed to NOT include OpenAPI examples

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--add-openapi-examples') { // Flag to ENABLE OpenAPI examples
            addOpenApiExamples = true;
        } else if (arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        } else if (arg.startsWith('-')) {
            console.error(`Error: Unknown option "${arg}"`);
            printHelp();
            process.exit(1);
        } else if (!jsonString) {
            // Assume the first non-flag argument is the JSON string
            jsonString = arg;
        } else {
            console.error("Error: Too many arguments provided. Expected a single JSON string or input via stdin.");
            printHelp();
            process.exit(1);
        }
    }

    // If no JSON string is provided via arguments, try reading from stdin
    if (!jsonString) {
        // Check if stdin is a TTY (interactive terminal). If so, prompt the user.
        // If not (e.g., piped input), it will just wait for stdin.
        if (process.stdin.isTTY) {
            console.log("Enter JSON (Ctrl+D to finish, Ctrl+C to exit):");
        }
        jsonString = await readFromStdin();
    }

    if (!jsonString) {
        console.error("Error: No JSON input provided.");
        printHelp();
        process.exit(1);
    }

    try {
        const parsedJson = JSON.parse(jsonString);
        // Call the core generator function with the parsed JSON and options
        const zodSchemaOutput = generateZodSchema(parsedJson, { addOpenApiExamples });
        console.log(zodSchemaOutput);
    } catch (e: any) {
        if (e instanceof SyntaxError) {
            console.error(`Error: Invalid JSON input. ${e.message}`);
        } else {
            console.error(`An unexpected error occurred: ${e.message}`);
        }
        process.exit(1);
    }
}

/**
 * Reads all data from standard input (stdin) until EOF.
 * @returns A promise that resolves with the accumulated input string.
 */
function readFromStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf8');

        process.stdin.on('readable', () => {
            let chunk;
            while ((chunk = process.stdin.read()) !== null) {
                data += chunk;
            }
        });

        process.stdin.on('end', () => {
            resolve(data);
        });

        process.stdin.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Prints the help message for the CLI tool.
 */
function printHelp() {
    const scriptName = path.basename(process.argv[1] || 'json2zod');
    console.log(`
Usage: ${scriptName} [options] [json_string]

Generate a Zod schema from a JSON string.
If no JSON string is provided, input is read from stdin.

Options:
  --add-openapi-examples  Include .openapi({ example: ... }) in the generated schema.
                          By default, examples are NOT included.
  -h, --help              Show this help message and exit.

Examples:
  # Pass JSON as a string argument (no OpenAPI examples by default)
  ${scriptName} '{"name": "Alice", "age": 30}'

  # Pipe JSON from a file with OpenAPI examples
  cat data.json | ${scriptName} --add-openapi-examples

  # Pipe JSON from stdin without OpenAPI examples (default)
  echo '{"item": "pen"}' | ${scriptName}
`);
}

// Execute the main CLI function
main();
