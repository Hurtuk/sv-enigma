<!doctype html>
<html lang="fr">
	<head>
		<title>Enigme de Pâques</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta charset="utf-8"/>
		<style>
			body {
				font-size: 60vh;
				text-align: center;
				color: #F5E722;
				background-color: #274EAB;
			}
			div {
				font-size: 2rem;
			}
		</style>
	</head>
	<body>
		<?= htmlspecialchars($_GET['letter'] ?? '', ENT_QUOTES, 'UTF-8') ?>
		<div>Trouvez les 12 lettres, devinez l'expression mystère et dites-la à Nicolas, à la sono !</div>
	</body>
</html>