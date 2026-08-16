<?php
	class DB {
		
		private $db;
		private $last_req;
		private $last_req_prepared;
		private $config;

		/************************************************************************/
		//	Configuration
		//
		//	Chargée à part de la connexion : le préfixe de tables est nécessaire
		//	dès la première requête, avant même que PDO soit sollicité.
		//	Les identifiants vivent dans config.php, qui n'est pas versionné.
		//	Voir config.sample.php pour le modèle.
		/************************************************************************/
		private function config() {
			if ($this->config === NULL) {
				$configFile = __DIR__ . '/config.php';
				if (!file_exists($configFile)) {
					throw new RuntimeException('back/php/config.php est absent : copier config.sample.php et y renseigner les identifiants de la base.');
				}
				$this->config = require $configFile;
			}
			return $this->config;
		}

		/************************************************************************/
		//	Prefixe de tables
		//
		//	La base est partagée avec les autres projets : les requêtes écrivent
		//	{p} devant chaque table, remplacé ici par le préfixe de config.php.
		//	Un préfixe vide redonne les noms de tables nus.
		/************************************************************************/
		private function sql($requeteSQL) {
			$config = $this->config();
			$prefix = isset($config['prefix']) ? $config['prefix'] : '';
			return str_replace('{p}', $prefix, $requeteSQL);
		}

		/************************************************************************/
		//	Connexion à la base
		/************************************************************************/
		private function connect() {
			if ($this->db == null) {
				$config = $this->config();
				$pdo_options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;
				try {
					$connexion = new PDO('mysql:host=' . $config['host'] . ';dbname=' . $config['database'], $config['user'], $config['password'], $pdo_options);
					$this->db = $connexion;
					$this->last_req = "";
					$this->last_req_prepared = NULL;
					$this->db->exec("SET NAMES utf8mb4");
					$this->db->exec("SET SESSION group_concat_max_len = 1000000;");
				} catch (PDOException $e) {
					error_log('[sv-enigma] ' . $e->getMessage());
					$this->db = NULL;
				}
			}
			return $this->db;
		}

		/***************************************************************/
		// SELECT generique sur une table quelconque
		/***************************************************************/
		function select($requeteSQL, $tabParam = array()) {
			$requeteSQL = $this->sql($requeteSQL);
			if ($requeteSQL != $this->last_req) {
				$this->last_req = $requeteSQL;
				try {
					$this->last_req_prepared = $this->connect()->prepare($requeteSQL);
					return $this->select($requeteSQL, $tabParam);
				} catch (PDOException $e) {
					error_log('[sv-enigma] ' . $e->getMessage());
				}
				return NULL;
			}
			$tab = array();
			try {
				$this->last_req_prepared->execute($tabParam);
				while ($tuple = $this->last_req_prepared->fetch()) {
					array_push($tab, array_filter($tuple, function($k) { return !is_numeric($k); }, ARRAY_FILTER_USE_KEY));
				}
				$this->last_req_prepared->closeCursor();
			} catch(PDOException $e) {
				error_log('[sv-enigma] ' . $e->getMessage());
			}
			return $tab;
		}
		
		/***************************************************************/
		// SELECT generique sur une table quelconque avec un seul resultat
		/***************************************************************/
		function selectVal($requeteSQL, $tabParam = array()) {
			$requeteSQL = $this->sql($requeteSQL);
			if ($requeteSQL != $this->last_req) {
				$this->last_req = $requeteSQL;
				try {
					$this->last_req_prepared = $this->connect()->prepare($requeteSQL);
					return $this->selectVal($requeteSQL, $tabParam);
				} catch (PDOException $e) {
					error_log('[sv-enigma] ' . $e->getMessage());
				}
				return NULL;
			}
			$res = null;
			try {
				$this->last_req_prepared->execute($tabParam);
				if ($tuple = $this->last_req_prepared->fetch()) {
					$res = array_filter($tuple, function($k) { return !is_numeric($k); }, ARRAY_FILTER_USE_KEY);
				}
				$this->last_req_prepared->closeCursor();
			} catch(PDOException $e) {
				error_log('[sv-enigma] ' . $e->getMessage());
			}
			return $res;
		}

		/***************************************************************/
		// MAJ generique sur une table quelconque
		/***************************************************************/
		function update($requeteSQL, $tabParam = array()) {
			$requeteSQL = $this->sql($requeteSQL);
			if ($requeteSQL != $this->last_req) {
				$this->last_req = $requeteSQL;
				try {
					$this->last_req_prepared = $this->connect()->prepare($requeteSQL);
					$this->update($requeteSQL, $tabParam);
				} catch (PDOException $e) {
					error_log('[sv-enigma] ' . $e->getMessage());
				}
			} else {
				try {
					$this->last_req_prepared->execute($tabParam);
					$this->last_req_prepared->closeCursor();
				} catch(PDOException $e) {
					error_log('[sv-enigma] ' . $e->getMessage());
				}
			}
		}
	}
?>
