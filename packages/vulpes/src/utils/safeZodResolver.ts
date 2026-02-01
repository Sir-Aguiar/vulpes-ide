import { z } from "zod";
import { FieldError, ResolverResult } from "react-hook-form";

export const safeZodResolver = <TSchema extends z.ZodType<any, any>>(
  schema: TSchema,
) => {
  type TFieldValues = z.infer<TSchema>;

  return async (data: TFieldValues): Promise<ResolverResult<TFieldValues>> => {
    try {
      const result = await schema.safeParseAsync(data);

      if (!result.success) {
        const errors: Record<string, FieldError> = {};

        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          if (!errors[path]) {
            errors[path] = {
              type: issue.code,
              message: issue.message,
            };
          }
        });

        return {
          values: {},
          errors,
        } as ResolverResult<TFieldValues>;
      }

      return {
        values: result.data,
        errors: {},
      } as ResolverResult<TFieldValues>;
    } catch (error) {
      console.error("Validation error:", error);
      return {
        values: {},
        errors: {
          root: {
            type: "manual",
            message: "Erro na validação do formulário",
          },
        },
      } as ResolverResult<TFieldValues>;
    }
  };
};
