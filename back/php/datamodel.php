<?php
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET, POST');
	header("Access-Control-Allow-Headers: X-Requested-With");
	
	// Rien ne doit être affiché au navigateur : le moindre avertissement PHP se
	// mêlerait au JSON de l'API et rendrait la panne incompréhensible côté jeu.
	// Tout part dans le journal d'erreurs du serveur.
	ini_set('display_errors', '0');
	ini_set('display_startup_errors', '0');
	ini_set('log_errors', '1');
	error_reporting(E_ALL);
	
	require_once "DB.class.php";
	
	global $db;
	
	$db = new DB();
?>