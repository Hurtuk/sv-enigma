-- Rend relatives les images des énigmes du musée.
--
-- Six questions (une par équipe concernée) affichent une portée musicale via
-- `<img src="/badge.png">`. Ce chemin partant de la racine du domaine, il cesse
-- de fonctionner dès que le site n'est plus servi à cette racine — ce qui est le
-- cas depuis le passage à https://nicoailleurs.com/sv.
--
-- En relatif, l'image est résolue contre le `<base href>` de la page, que le
-- build renseigne : le jeu suit désormais son préfixe sans retouche.
--
-- Rejouable sans dommage : les lignes déjà converties ne contiennent plus
-- `src="/` et ne sont donc pas touchées.

UPDATE questions
SET question = REPLACE(question, 'src="/', 'src="')
WHERE question LIKE '%src="/%';

-- Vérification : doit renvoyer 0.
-- SELECT COUNT(*) FROM questions WHERE question LIKE '%src="/%';
