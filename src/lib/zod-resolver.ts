import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodSchema } from "zod";

/**
 * Resolver mínimo para react-hook-form basado en Zod.
 * Lo escribimos a mano para evitar conflictos de versiones entre
 * @hookform/resolvers y zod.
 */
export function zodFormResolver<T extends FieldValues>(schema: ZodSchema<T>): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".") || "root";
      if (!errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {}, errors: errors as never };
  };
}
