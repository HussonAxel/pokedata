import { Button } from "@pokedata/ui/components/button";
import { FieldGroup } from "@pokedata/ui/components/field";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { FormTextField } from "@/features/auth/form-text-field";
import { safeRedirect } from "@/features/auth/redirect";
import { authClient } from "@/lib/auth-client";
import { play } from "cuelume";

/** Bornes par défaut de Better Auth (`minPasswordLength`, `maxPasswordLength`). */
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

const schema = z.object({
  name: z.string().trim().min(2, "Au moins 2 caractères.").max(50, "50 caractères au plus."),
  email: z.email("Adresse e-mail invalide."),
  password: z
    .string()
    .min(PASSWORD_MIN, `Au moins ${PASSWORD_MIN} caractères.`)
    .max(PASSWORD_MAX, `${PASSWORD_MAX} caractères au plus.`),
});

export function SignUpForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: { onSubmit: schema },
    // Champ invalide : un son discret, en plus du message sous le champ.
    onSubmitInvalid: () => play("error"),
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(value, {
        onSuccess: async () => {
          play("success");
          toast.success("Bienvenue sur Pokedata !");
          await router.invalidate();
          await router.history.push(safeRedirect(redirectTo));
        },
        onError: (error) => {
          play("error");
          toast.error(error.error.message || "Impossible de créer le compte.");
        },
      });
    },
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="name">
          {(field) => <FormTextField field={field} label="Pseudo" autoComplete="nickname" />}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <FormTextField field={field} label="Adresse e-mail" type="email" autoComplete="email" />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <FormTextField
              field={field}
              label="Mot de passe"
              type="password"
              autoComplete="new-password"
              description={`${PASSWORD_MIN} caractères minimum. Une phrase de passe est plus sûre qu’un mot complexe.`}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Création du compte…" : "Créer mon compte"}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
