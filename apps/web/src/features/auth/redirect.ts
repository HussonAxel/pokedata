/**
 * Destination après connexion : un chemin interne seulement. Un lien externe
 * (`https://…`, `//…`) ferait de la page de connexion une redirection ouverte.
 */
export function safeRedirect(target: string | undefined) {
  return target && target.startsWith("/") && !target.startsWith("//") ? target : "/moi";
}
