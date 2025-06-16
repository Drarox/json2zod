/**
 * Recursively infers the appropriate Zod type for a given JavaScript value.
 * Conditionally includes an OpenAPI example based on the `addOpenApiExamples` setting.
 *
 * @param value The JavaScript value to infer the Zod type for.
 * @param addOpenApiExamples A boolean indicating whether to add `.openapi({ example: ... })` calls.
 * @returns A string representing the Zod type definition, potentially with an OpenAPI example.
 */
function inferZodType(value: any, addOpenApiExamples: boolean): string {
    const exampleValueString: string = JSON.stringify(value); // Stringify for use in example
    let baseZodType: string;

    switch (typeof value) {
        case 'string':
            baseZodType = 'z.string()';
            break;
        case 'number':
            baseZodType = 'z.number()';
            break;
        case 'boolean':
            baseZodType = 'z.boolean()';
            break;
        case 'object':
            if (value === null) {
                // Handle explicit null values
                baseZodType = 'z.null()';
            } else if (Array.isArray(value)) {
                // Handle arrays recursively
                if (value.length > 0) {
                    // If array is not empty, infer the type of its first element
                    const innerType = inferZodType(value[0], addOpenApiExamples);
                    baseZodType = `z.array(${innerType})`;
                } else {
                    // If array is empty, default to array of any
                    baseZodType = `z.array(z.any())`;
                }
            } else {
                // Handle nested objects recursively
                baseZodType = generateObjectSchemaString(value, addOpenApiExamples);
            }
            break;
        default:
            // Fallback for other types like 'undefined', 'symbol', 'bigint', 'function'
            baseZodType = `z.any()`;
    }

    // Conditionally append the .openapi({ example: ... }) call
    if (addOpenApiExamples) {
        return `${baseZodType}.openapi({ example: ${exampleValueString} })`;
    } else {
        return baseZodType;
    }
}

/**
 * Generates a Zod object schema string for a given JavaScript object.
 * This function is called recursively for nested objects.
 *
 * @param obj The JavaScript object to generate the schema for.
 * @param addOpenApiExamples A boolean indicating whether to add `.openapi({ example: ... })` calls.
 * @returns A string representing the Zod object schema.
 */
function generateObjectSchemaString(obj: any, addOpenApiExamples: boolean): string {
    const schemaParts: string[] = [];

    // Iterate over the properties of the object to build its schema
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            // Recursively infer the Zod type for each property
            schemaParts.push(`    ${key}: ${inferZodType(value, addOpenApiExamples)}`);
        }
    }
    return `z.object({\n${schemaParts.join(',\n')}\n})`;
}

/**
 * Generates the complete Zod schema string from the initial input JSON data.
 * This handles both single objects and arrays of objects at the top level.
 *
 * @param inputJson The parsed JSON object or array of objects to base the schema on.
 * @param options Configuration options.
 * @param options.addOpenApiExamples A boolean indicating whether to add `.openapi({ example: ... })` calls.
 * Defaults to `false`.
 * @returns A string containing the complete TypeScript code for the Zod schema.
 */
export function generateZodSchema(inputJson: any, options?: { addOpenApiExamples?: boolean }): string {
    // Default to false for addOpenApiExamples if not provided
    const addOpenApiExamples = options?.addOpenApiExamples ?? false;

    let schemaBody: string; // This will hold the z.object(...) or z.array(z.object(...)) part

    if (Array.isArray(inputJson)) {
        if (inputJson.length === 0) {
            // Handle empty top-level array
            schemaBody = `z.array(z.object({}))`;
        } else {
            // Generate schema for the first element and wrap it in z.array()
            schemaBody = `z.array(${generateObjectSchemaString(inputJson[0], addOpenApiExamples)})`;
        }
    } else if (typeof inputJson === 'object' && inputJson !== null) {
        // Generate schema for a single top-level object
        schemaBody = generateObjectSchemaString(inputJson, addOpenApiExamples);
    } else {
        // Handle invalid top-level input type, returning z.any() as a fallback schema.
        return `export const schema = z.any();`;
    }

    // The output string now *only* contains the schema definition.
    // It is assumed that 'z' is globally available or imported by the consuming environment.
    return `export const schema = ${schemaBody};`;
}
