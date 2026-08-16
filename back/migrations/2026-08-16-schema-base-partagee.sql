-- Schéma des tables du jeu.
-- Base partagée de l'hébergement : les tables sont préfixées « sv_ », ce
-- qui doit correspondre à la clé 'prefix' de back/php/config.php.
-- Généré depuis la base locale, déjà porteuse de la migration des chemins d'images.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `sv_places` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sv_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answer` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sv_transitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `color` varchar(10) NOT NULL,
  `code` varchar(10) NOT NULL,
  `number` int NOT NULL,
  `placeEnigma` text NOT NULL,
  `idPlace` int NOT NULL,
  `idQuestion` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
