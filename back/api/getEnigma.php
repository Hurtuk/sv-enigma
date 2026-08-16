<?php
    include "../php/datamodel.php";

    global $db;
	
	header('Content-Type: application/json; charset=utf-8');

	$code = $_GET['code'] ?? '';

	$enigma = $db->selectVal('SELECT color, code, number, placeEnigma, question, answer, name
							FROM transitions t
							INNER JOIN places p
							ON p.id = t.idPlace
							LEFT JOIN questions q
							ON q.id = t.idQuestion
							WHERE code = ?', array($code));

    echo json_encode($enigma);
?>