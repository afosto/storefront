/**
 * Input keys that the schema spells with an underscore in front of the digit, mapped to the
 * name they have to leave the client with.
 *
 * `@afosto/graphql-client` converts the variables to snake_case on the way out and the response
 * to camelCase on the way back, but the two are not each other's inverse around a digit: the
 * response key `address_line_1` becomes `addressLine1`, while `addressLine1` becomes
 * `address_line1` instead of `address_line_1`. The gateway then rejects the whole request with
 * `unknown field address_line1`, so every address sent through the client failed.
 *
 * A key that is already snake_case survives the conversion unchanged, so renaming it here is
 * enough. Keep the camelCase name in the public types: it is the name the response comes back
 * with, and the name shops already use.
 */
const SCHEMA_KEYS: Record<string, string> = {
  addressLine1: 'address_line_1',
  addressLine2: 'address_line_2',
  addressLine3: 'address_line_3',
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

/**
 * Rename the variable keys that the snake_case conversion gets wrong, anywhere in the variables.
 * Values are left untouched, and anything that is not a plain object or an array is passed
 * through as it is.
 */
export const toSchemaVariables = <T>(variables: T): T => {
  if (Array.isArray(variables)) {
    return variables.map(item => toSchemaVariables(item)) as T;
  }

  if (!isPlainObject(variables)) {
    return variables;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(variables)) {
    result[SCHEMA_KEYS[key] ?? key] = toSchemaVariables(value);
  }

  return result as T;
};
