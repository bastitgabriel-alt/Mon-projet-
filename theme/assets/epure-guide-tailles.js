/**
 * ÉPURE — Guide des tailles en tiroir latéral.
 *
 * Repose sur <dialog> natif. Ce choix n'est pas cosmétique : l'élément fournit
 * gratuitement le piège de focus, la fermeture par Échap, la restauration du
 * focus sur le déclencheur et l'inertage de l'arrière-plan — soit exactement
 * les quatre exigences du brief §8 pour les tiroirs.
 *
 * Aucune dépendance, aucun écouteur global.
 *
 * Sans JavaScript, showModal() n'est jamais appelé : la feuille de style du
 * bloc rétablit alors le panneau en flux normal via @media (scripting: none),
 * de sorte que le tableau reste lisible. Le conseil de coupe est de toute
 * façon repris dans l'accordéon « Taille & coupe » de la fiche produit.
 */

class EpureGuideTailles extends HTMLElement {
  connectedCallback() {
    this.declencheur = this.querySelector('[data-guide-ouvrir]');
    this.panneau = this.querySelector('[data-guide-panneau]');
    if (!this.declencheur || !this.panneau) return;

    this.ouvrir = () => {
      if (typeof this.panneau.showModal === 'function') this.panneau.showModal();
    };
    this.fermer = () => {
      if (typeof this.panneau.close === 'function') this.panneau.close();
    };
    // Un clic sur le fond ferme le tiroir : la zone du <dialog> déborde le
    // panneau visible, donc seule une cible strictement égale au dialog compte.
    this.surClicFond = (evenement) => {
      if (evenement.target === this.panneau) this.fermer();
    };

    this.declencheur.addEventListener('click', this.ouvrir);
    this.panneau.addEventListener('click', this.surClicFond);

    this.boutonsFermeture = Array.from(this.panneau.querySelectorAll('[data-guide-fermer]'));
    for (const bouton of this.boutonsFermeture) {
      bouton.addEventListener('click', this.fermer);
    }
  }

  disconnectedCallback() {
    this.declencheur?.removeEventListener('click', this.ouvrir);
    this.panneau?.removeEventListener('click', this.surClicFond);
    for (const bouton of this.boutonsFermeture ?? []) {
      bouton.removeEventListener('click', this.fermer);
    }
  }
}

if (!customElements.get('epure-guide-tailles')) {
  customElements.define('epure-guide-tailles', EpureGuideTailles);
}
