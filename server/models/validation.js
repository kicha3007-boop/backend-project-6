// Ошибка валидации модели: errors — сообщения по именам полей, как их ждут шаблоны форм
export class ValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.errors = errors;
  }
}

export const parseWith = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  const errors = {};
  result.error.issues.forEach(({ path, message }) => {
    const field = path.join(".");
    errors[field] = [...(errors[field] ?? []), message];
  });
  throw new ValidationError(errors);
};

// Нарушение ограничения базы (уникальность, внешний ключ) приходит кодом PostgreSQL
const pgCode = (error) => error?.code ?? error?.cause?.code;
export const isUniqueViolation = (error) => pgCode(error) === "23505";
export const isForeignKeyViolation = (error) => pgCode(error) === "23503";
