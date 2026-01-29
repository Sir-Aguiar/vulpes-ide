import { z } from 'zod';
import { FieldError } from 'react-hook-form';

export const safeZodResolver = <T extends z.ZodType<any, any>>(schema: T) => {
    return async (data: any, _context: any, _options: any) => {
        try {
            const result = await schema.safeParseAsync(data);

            if (!result.success) {
                const errors: Record<string, FieldError> = {};
                
                result.error.issues.forEach((issue) => {
                    const path = issue.path.join('.');
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
                };
            }

            return {
                values: result.data,
                errors: {},
            };
        } catch (error) {
            console.error('Validation error:', error);
            return {
                values: {},
                errors: {
                    root: {
                        type: 'manual',
                        message: 'Erro na validação do formulário',
                    },
                },
            };
        }
    };
};