/**
 * ÉPURE — Comparateur « Sans le body » / « Avec le body ».
 *
 * Élément personnalisé autonome : aucune dépendance, aucune importation, aucun
 * écouteur global (brief §3). Le composant ne fait que piloter la propriété
 * --compare ; tout le rendu est en CSS.
 *
 * Le déplacement repose sur un <input type="range"> natif. C'est délibéré :
 * le navigateur fournit alors le pointeur, le tactile, le clavier
 * (flèches, Origine/Fin), le rôle « slider » et aria-valuenow sans une ligne
 * de code — et sans les divergences de comportement d'une poignée maison.
 *
 * Sans JavaScript, la page reste lisible : --compare garde sa valeur initiale
 * appliquée en style inline côté serveur, les deux images restent visibles.
 */

const mouvementReduit = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class EpureComparateur extends HTMLElement {
  connectedCallback() {
    this.zone = this.querySelector('[data-comparateur-zone]');
    this.curseur = this.querySelector('[data-comparateur-curseur]');
    if (!this.zone || !this.curseur) return;

    this.surSaisie = () => this.synchronise();
    this.curseur.addEventListener('input', this.surSaisie);
    this.synchronise();

    // L'amorce n'est qu'un signal d'affordance : elle est purement décorative
    // et ne se déclenche jamais si l'utilisateur a demandé moins de mouvement.
    if (mouvementReduit() || !('IntersectionObserver' in window)) return;

    this.observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (!entree.isIntersecting) continue;
          this.amorce();
          this.arreteObservation();
        }
      },
      { threshold: 0.5 }
    );
    this.observateur.observe(this);
  }

  disconnectedCallback() {
    this.curseur?.removeEventListener('input', this.surSaisie);
    this.arreteObservation();
    if (this.image) cancelAnimationFrame(this.image);
  }

  arreteObservation() {
    this.observateur?.disconnect();
    this.observateur = null;
  }

  synchronise() {
    if (this.enAnimation) return;
    this.applique(Number(this.curseur.value));
  }

  applique(valeur) {
    this.zone.style.setProperty('--compare', String(valeur));
  }

  /**
   * Un aller-retour unique, de la position initiale vers +15 %, puis retour.
   * Piloté par requestAnimationFrame plutôt que par une chaîne de setTimeout :
   * une seule poignée à annuler au démontage, et aucune écriture sur un
   * élément détaché.
   */
  amorce() {
    if (this.dejaAmorce) return;
    this.dejaAmorce = true;
    this.enAnimation = true;

    const depart = Number(this.curseur.value);
    const sommet = Math.min(100, depart + 15);
    const duree = 900;
    const debut = performance.now();

    const pas = (maintenant) => {
      const avancement = Math.min(1, (maintenant - debut) / duree);
      // Sinusoïde : part de 0, culmine à 1 à mi-parcours, revient à 0.
      const onde = Math.sin(avancement * Math.PI);
      this.applique(depart + (sommet - depart) * onde);

      if (avancement < 1) {
        this.image = requestAnimationFrame(pas);
        return;
      }
      this.enAnimation = false;
      this.applique(depart);
    };

    this.image = requestAnimationFrame(pas);
  }
}

if (!customElements.get('epure-comparateur')) {
  customElements.define('epure-comparateur', EpureComparateur);
}
