import express = require("express");
import wrap = require("express-async-error-wrapper");
import Usuario = require("../models/usuario");
import Jogo = require("../models/jogo");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		res.render("jogo/alterar", { titulo: "Criar Jogo", usuario: u, item: null });
	}
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id"]);
		let item: Jogo = null;
		if (isNaN(id) || !(item = await Jogo.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("jogo/alterar", { titulo: "Editar Jogo", usuario: u, item: item });
	}
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		res.render("jogo/listar", { titulo: "Gerenciar Jogos", usuario: u, lista: JSON.stringify(await Jogo.listar()) });
	}
}));

// Deve deixar por último, senão id poderia ser parte de um caminho, como "listar"!
router.get("/:i", wrap(async (req: express.Request, res: express.Response) => {
	let j: Jogo = null;
	let id = parseInt(req.params["i"]);
	if (isNaN(id) || id <= 0)
		id = 0;
	else
		j = await Jogo.obter(id);
	res.render("jogo/leaderboard", { layout: "layout-externo", imagemFundo: true, titulo: (j ? j.nome : undefined), url_externa: (j ? j.url_externa : ""), tipo_pontuacao: (j ? j.tipo_pontuacao : 0), id: id });
}));

export = router;
