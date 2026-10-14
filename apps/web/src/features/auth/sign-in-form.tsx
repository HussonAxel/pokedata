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

const schema = z.object({
  email: z.email("Adresse e-mail invalide."),
  password: z.string().min(1, "Saisissez votre mot de passe."),
});

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: schema },
    // Champ invalide : un son discret, en plus du message sous le champ.
    onSubmitInvalid: () => play("error"),
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(value, {
        onSuccess: async () => {
          play("success");
          toast.success("Vous êtes connecté.");
          await router.invalidate();
          await router.history.push(safeRedirect(redirectTo));
        },
        onError: () => {
          play("error");
          // Même message que l'adresse existe ou non : rien n'est révélé.
          toast.error("Adresse e-mail ou mot de passe incorrect.");
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
              autoComplete="current-password"
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Connexion…" : "Se connecter"}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
