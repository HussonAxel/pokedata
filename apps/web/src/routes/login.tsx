import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pokedata/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { PageContainer } from "@/components/page-container";
import { SignInForm } from "@/features/auth/sign-in-form";
import { SignUpForm } from "@/features/auth/sign-up-form";

const MODES = ["connexion", "inscription"] as const;

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    mode: z.enum(MODES).optional().catch(undefined),
    // Page à rouvrir après connexion ; vérifiée par `safeRedirect`.
    redirect: z.string().max(500).optional(),
  }),
  head: () => ({ meta: [{ title: "Connexion · Pokedata" }] }),
  component: Page,
});

function Page() {
  const { mode = "connexion", redirect } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <PageContainer className="max-w-md justify-center">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>{mode === "connexion" ? "Bon retour parmi nous" : "Créer un compte"}</h1>
          </CardTitle>
          <CardDescription>
            Votre compte garde vos équipes, collections et progression.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={mode}
            onValueChange={(value) => {
              const next = MODES.find((entry) => entry === value);
              if (next)
                void navigate({
                  search: (previous) => ({ ...previous, mode: next }),
                  replace: true,
                });
            }}
            variant="segment"
            className="flex flex-col gap-6"
          >
            <TabsList aria-label="Connexion ou inscription" className="bg-muted">
              <TabsTrigger value="connexion">Se connecter</TabsTrigger>
              <TabsTrigger value="inscription">Créer un compte</TabsTrigger>
            </TabsList>
            <TabsContent value="connexion">
              <SignInForm redirectTo={redirect} />
            </TabsContent>
            <TabsContent value="inscription">
              <SignUpForm redirectTo={redirect} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
