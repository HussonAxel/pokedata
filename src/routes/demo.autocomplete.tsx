import { AutocompleteExample } from "@/components/AutocompleteExample";
import { PokemonAutocomplete } from "@/components/PokemonAutocomplete";

export default function AutocompleteDemo() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-6">Démonstration AutoComplete</h1>
          <p className="text-muted-foreground mb-8">
            Ce composant AutoComplete permet de rechercher et sélectionner des options dans une liste.
            Il supporte les états de chargement, désactivé et offre une expérience utilisateur fluide.
          </p>
        </div>
        
        {/* Exemple de base */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Exemple de base</h2>
          <AutocompleteExample />
        </div>

        {/* Exemple avec données Pokémon */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Exemple avec données réelles</h2>
          <PokemonAutocomplete />
        </div>
        
        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Fonctionnalités</h2>
          <ul className="space-y-2 text-sm">
            <li>• Recherche en temps réel dans les options</li>
            <li>• Navigation au clavier (flèches, Entrée, Échap)</li>
            <li>• État de chargement avec skeleton</li>
            <li>• Support des états désactivés</li>
            <li>• Interface responsive et accessible</li>
            <li>• Animations fluides</li>
            <li>• Intégration avec TanStack Query pour les données</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 