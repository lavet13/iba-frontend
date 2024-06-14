import { z } from 'zod';

export const numberFormatValuesSchema = z
  .object({
    floatValue: z.number(),
    formattedValue: z.string(),
    value: z.string(),
  })
  .partial()
  .refine(
    values => {
      return values.value !== undefined;
    },
    {
      message: 'Поле обязательное!',
    }
  )
  .refine(
    values => {
      const parsedValue = parseInt(values.value!);

      return (
        !isNaN(parsedValue) &&
        isFinite(parsedValue) &&
        parsedValue >= Number.MIN_SAFE_INTEGER &&
        parsedValue <= Number.MAX_SAFE_INTEGER
      );
    },
    {
      message: `Число выходит за рамки!`,
    }
  );
