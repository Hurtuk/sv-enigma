<?php
	include "php/datamodel.php";

	global $db;

	/* UPDATE */

	if (isset($_POST['action'])) {
		switch ($_POST['action']) {
			case 'questions':
				$place = $_POST['place'];
				$colors = $_POST['color'];
				$questions = $_POST['question'];
				$answers = $_POST['answer'];
				$updates = $_POST['update'];
				foreach ($colors as $i => $c) {
					if ($questions[$i]) {
						if ($updates[$i] == '1') {
							$db->update('UPDATE questions SET question = ?, answer = ? WHERE id = (SELECT idQuestion FROM transitions WHERE color = ? AND idPlace = ?)',
								array($questions[$i], $answers[$i], $c, $place));
						} else {
							$db->update('INSERT INTO questions (question, answer) VALUES (?, ?)',
								array($questions[$i], $answers[$i]));
							$id = $db->selectVal('SELECT id FROM questions ORDER BY id DESC LIMIT 1')['id'];
							$db->update('UPDATE transitions SET idQuestion = ? WHERE color = ? AND idPlace = ?',
								array($id, $colors[$i], $place));
						}
					}
				}
				break;
			case 'to-place':
				$transition = $_POST['transition'];
				$enigma = $_POST['place-enigma'];
				$db->update("UPDATE transitions SET placeEnigma = ? WHERE id = ?", array($enigma, $transition));
				break;
		}
	}

	/**********/

	$req = 'SELECT t.*, q.id as idQuestion, q.question, q.answer, p.name FROM transitions t
			INNER JOIN places p ON p.id = t.idPlace
			LEFT JOIN questions q ON q.id = t.idQuestion
			ORDER BY color, number';

	$transitions = $db->select($req);

	$colors = array('black', 'blue', 'brown', 'cyan', 'gray', 'green', 'lightgreen', 'orange', 'pink', 'purple', 'red', 'yellow');
?>
<!DOCTYPE html>
<html>
	<head>
		<title>SV back-office</title>
		<meta charset="utf-8" />
		<script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/Trumbowyg/2.25.1/trumbowyg.min.js"></script>
		<link href="https://cdnjs.cloudflare.com/ajax/libs/Trumbowyg/2.25.1/ui/trumbowyg.min.css" rel="stylesheet" />
		<style>
			body {
				font-family: sans-serif;
			}
			ul {
				margin: 0; padding: 0;
			}
			li {
				margin: 0; padding: 0;
			}
			table {
				border-collapse: collapse;
			}
			th, td {
				border: 1px solid black;
			}
			.content {
				display: none;
			}
			.clicked {
				outline: 3px solid black;
			}
		</style>
	</head>
	<body>
		<fieldset>
			<legend>Les énigmes</legend>
			<table class="recap">
				<thead>
					<tr>
						<th>Equipe</th>
						<?php for ($i = 1; $i <= 12; $i++) { ?><th><?= $i ?></th><?php } ?>
					</tr>
				</thead>
				<tbody>
					<?php
						// Chaque case vaut deux points à écrire : l'énigme du lieu et
						// la question posée sur place. Le hall termine le parcours et
						// n'a pas de question : il ne compte que pour un.
						$last_color = null;
						$todo = 0;
						$done = 0;
						foreach ($transitions as $t) {
							if ($last_color != $t['color']) {
								if ($last_color) {
									?></tr><?php
								}
								?><tr><td style="background-color: <?= $t['color'] ?>; color: #fff; font-weight: bold;"><?= $t['color'] ?></td><?php
							}
							?><td style="text-align: center; font-size: .75rem; cursor: pointer; background-color: <?php
								if (!$t['placeEnigma'] && !$t['question']) { echo '#ff000059'; }
								else if (!$t['placeEnigma'] && $t['question']) { echo '#ffa50087'; $done++; }
								else if ($t['placeEnigma'] && !$t['question']) { echo '#0095ff87'; $done++; }
								else { echo '#00800073'; $done += 2; }
								$todo += $t['name'] === 'Le hall' ? 1 : 2;
							?>" data-id="<?= $t['id'] ?>" data-content="<?= htmlentities($t['placeEnigma']) ?>"><?= $t['name'] ?></td><?php
							$last_color = $t['color'];
						}
					?>
					</tr>
				</tbody>
			</table>
			<p>Faits : <?= $todo ? round($done * 100 / $todo) : 0 ?>%</p>
		</fieldset>
		<fieldset style="float: left">
			<legend>Les lieux</legend>
			<ul>
				<?php
					$places = $db->select('SELECT * FROM places ORDER BY name');
					foreach ($places as $p) {
						// Le hall n'accueille pas d'énigme : rien à y rédiger.
						if ($p['name'] !== 'Le hall') {
							?><li><input type="radio" name="place" class="choose-place" id="place-<?= $p['id'] ?>" value="<?= $p['id'] ?>" /><label for="place-<?= $p['id'] ?>" value="<?= $p['id'] ?>"><?= $p['name'] ?></label></li><?php
						}
					}
				?>
			</ul>
		</fieldset>
		<?php
			foreach ($places as $p) {
				$questions = array_filter($transitions, function($item) use ($p) { return $item['idPlace'] == $p['id']; }); ?>
				<fieldset id="content-place-<?= $p['id'] ?>" class="content">
					<legend>Enigmes du lieu <?= $p['name'] ?></legend>
					<form action="" method="post">
						<input type="hidden" name="action" value="questions" />
						<input type="hidden" name="place" value="<?= $p['id'] ?>" />
						<ul>
							<?php
								$i = 1;
								foreach ($questions as $q) {
									?><li>
										<input type="hidden" name="color[]" value="<?= $q['color'] ?>" />
										<input type="hidden" name="update[]" value="<?= $q['question'] ? '1' : '0' ?>" />
										<div>Enigme <?= $i++ ?>:</div>
										<textarea name="question[]"><?= $q['question'] ?></textarea>
										<div style="margin-bottom: 2rem;">Réponse :<input type="text" name="answer[]" value="<?= $q['answer'] ?>" /></div>
									</li><?php
								}
							?>
						</ul>
						<input type="submit" value="Enregistrer" />
					</form>
				</fieldset>
			<?php }
		?>
		<fieldset id="content-transition" class="content">
			<legend>Enigme qui mène au lieu <span class="to-place"></span></legend>
			<form method="post" action="">
				<input type="hidden" name="action" value="to-place" />
				<input type="hidden" name="transition" value="" />
				<textarea name="place-enigma"></textarea>
				<input type="submit" value="Enregistrer" />
			</form>
		</fieldset>
		<script type="text/javascript">
			$('textarea').trumbowyg();
			$('.choose-place').change(function() {
				if ($(this).is(':checked')) {
					$('.content').hide();
					$('#content-place-' + $(this).val()).show();
				}
			});
			$('td').click(function() {
				$('.clicked').removeClass('clicked');
				$(this).addClass('clicked');
				const id = $(this).data('id');
				const content = $(this).data('content');
				const name = $(this).text();
				$('.content').hide();
				$('#content-transition').show();
				$('#content-transition [name=transition]').val(id);
				$('#content-transition [name="place-enigma"]').trumbowyg('html', content);
				$('#content-transition .to-place').text(name);
			});
		</script>
	</body>
</html>
