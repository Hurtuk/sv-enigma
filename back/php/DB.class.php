<?php
	class DB {
		
		private $db;
		private $last_req;
		private $last_req_prepared;

		/************************************************************************/
		//	Connexion à la base
		/************************************************************************/
		private function connect() {
			if ($this->db == null) {
				// Les identifiants vivent dans config.php, qui n'est pas versionné.
				// Voir config.sample.php pour le modèle.
				$configFile = __DIR__ . '/config.php';
				if (!file_exists($configFile)) {
					throw new RuntimeException('back/php/config.php est absent : copier config.sample.php et y renseigner les identifiants de la base.');
				}
				$config = require $configFile;
				$pdo_options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;
				try {
					$connexion = new PDO('mysql:host=' . $config['host'] . ';dbname=' . $config['database'], $config['user'], $config['password'], $pdo_options);
					$this->db = $connexion;
					$this->last_req = "";
					$this->last_req_prepared = NULL;
					$this->db->exec("SET NAMES utf8");
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
