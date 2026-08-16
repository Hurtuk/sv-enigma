<?php
	// Fichier de diagnostic TEMPORAIRE — à supprimer du serveur une fois la
	// base en place. Il ne révèle aucun identifiant : uniquement la présence
	// des clés de configuration, le code d'erreur MySQL et l'état des tables.
	//
	// Usage : https://ohrm.fr/sv/diagnostic-base.php?k=sv2026

	if (($_GET['k'] ?? '') !== 'sv2026') {
		http_response_code(404);
		exit;
	}

	header('Content-Type: text/plain; charset=utf-8');

	$configFile = __DIR__ . '/php/config.php';
	echo "config.php présent      : " . (file_exists($configFile) ? 'oui' : 'NON') . "\n";
	if (!file_exists($configFile)) {
		exit;
	}

	$config = require $configFile;
	echo "config.php renvoie      : " . gettype($config) . (is_array($config) ? '' : "  <-- devrait être un tableau") . "\n";
	if (!is_array($config)) {
		exit;
	}

	foreach (array('host', 'database', 'user', 'password', 'prefix') as $cle) {
		$present = array_key_exists($cle, $config);
		$vide = $present && $config[$cle] === '';
		// On n'affiche jamais la valeur, seulement si la clé existe et est remplie.
		echo str_pad("clé '$cle'", 24) . ': '
			. ($present ? ($vide ? 'présente mais vide' : 'présente et remplie') : 'ABSENTE') . "\n";
	}
	echo "longueur du préfixe     : " . strlen($config['prefix'] ?? '') . "\n\n";

	try {
		$pdo = new PDO(
			'mysql:host=' . $config['host'] . ';dbname=' . $config['database'],
			$config['user'],
			$config['password'],
			array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
		);
		echo "connexion               : OK\n\n";
	} catch (PDOException $e) {
		// Le message de PDO contient le compte et l'hôte : on ne garde que le code.
		$code = $e->errorInfo[1] ?? $e->getCode();
		$explications = array(
			1045 => "identifiant ou mot de passe refusé",
			1044 => "ce compte n'a pas accès à cette base",
			1049 => "cette base n'existe pas",
			2002 => "hôte injoignable (nom d'hôte erroné ?)",
			2005 => "nom d'hôte inconnu",
		);
		echo "connexion               : ÉCHEC\n";
		echo "code MySQL              : $code";
		echo isset($explications[$code]) ? "  ({$explications[$code]})\n" : "\n";
		exit;
	}

	$prefix = $config['prefix'] ?? '';
	foreach (array('places', 'questions', 'transitions') as $table) {
		$nom = $prefix . $table;
		try {
			$n = $pdo->query('SELECT COUNT(*) FROM `' . $nom . '`')->fetchColumn();
			echo str_pad("table $nom", 24) . ": $n lignes\n";
		} catch (PDOException $e) {
			echo str_pad("table $nom", 24) . ": ABSENTE\n";
		}
	}
