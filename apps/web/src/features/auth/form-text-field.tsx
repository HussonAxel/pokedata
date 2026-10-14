import { Field, FieldDescription, FieldError, FieldLabel } from "@pokedata/ui/components/field";
import { Input } from "@pokedata/ui/components/input";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { ComponentProps, ReactNode } from "react";

/**
 * Champ texte relié à un champ TanStack Form : libellé, saisie et erreurs de
 * validation, avec `aria-invalid` pour les lecteurs d'écran.
 */
export function FormTextField({
  field,
  label,
  description,
  ...props
}: { field: AnyFieldApi; label: string; description?: ReactNode } & Omit<
  ComponentProps<typeof Input>,
  "id" | "name" | "value" | "onBlur" | "onChange"
>) {
  const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const descriptionId = `${field.name}-description`;

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        aria-invalid={invalid || undefined}
        aria-describedby={description ? descriptionId : undefined}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        {...props}
      />
      {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
      {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}
