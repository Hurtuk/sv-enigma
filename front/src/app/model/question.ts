/**
 * Une étape du parcours d'une équipe, telle que renvoyée par `api/getEnigma.php`.
 *
 * Le chapitre final (13) n'a pas de question : il ne contient que l'énigme de lieu
 * qui envoie les équipes au hall, où la partie se termine.
 */
export interface Question {
  /** Couleur de l'équipe : `red`, `blue`, … */
  color: string;
  /** Début du MD5 de `color + number`. Identifie l'étape et sert de contenu aux QR codes. */
  code: string;
  /** Numéro du chapitre, de 1 à 13. */
  number: number;
  /** Devinette (HTML) qui désigne la salle suivante. */
  placeEnigma: string;
  /** Nom de la salle où se joue l'énigme. */
  name: string;
  /** Énigme (HTML) posée une fois la salle atteinte. */
  question: string | null;
  /** Réponse attendue, comparée après normalisation. */
  answer: string | null;
}
