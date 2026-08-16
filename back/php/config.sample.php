<?php
	// Modèle de configuration de la base.
	//
	// Copier ce fichier en config.php dans le même répertoire et y mettre les
	// identifiants réels. config.php n'est pas versionné : il diffère entre le
	// poste de développement et l'hébergement, et le dépôt est public.
	//
	// 'prefix' préfixe toutes les tables. La base de l'hébergement est partagée
	// avec les autres projets, et « places », « questions » et « transitions »
	// sont des noms trop courants pour y être posés nus. Les requêtes écrivent
	// {p} devant chaque table ; un préfixe vide redonne les noms nus.

	return array(
		'host'     => 'localhost',
		'database' => 'mystery',
		'user'     => 'root',
		'password' => '',
		'prefix'   => 'sv_',
	);
