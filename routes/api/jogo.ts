import express = require("express");
import wrap = require("express-async-error-wrapper");
import dataISOValida = require("../../utils/dataISOValida");
import jsonRes = require("../../utils/jsonRes");
import allowCors = require("../../utils/allowCors");
import Usuario = require("../../models/usuario");
import Jogo = require("../../models/jogo");

const router = express.Router();

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Jogo.listar());
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id"]);
	res.json(isNaN(id) ? null : await Jogo.obter(id));
}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let j = req.body as Jogo;
	j.idusuario = u.id;
	jsonRes(res, 400, j ? await Jogo.criar(j) : "Dados inválidos!");
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let j = req.body as Jogo;
	if (j) {
		j.id = parseInt(req.body.id);
		j.idusuario = j.id;
	}
	jsonRes(res, 400, (j && !isNaN(j.id)) ? await Jogo.alterar(j) : "Dados inválidos!");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id"]);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos!" : await Jogo.excluir(id));
}));

router.all("/listarPontuacao", wrap(async (req: express.Request, res: express.Response) => {
	allowCors(res);
	let idjogo = parseInt(req.query["idjogo"]);
	if (isNaN(idjogo) || idjogo <= 0)
		jsonRes(res, 400, "Dados inválidos!");
	else
		res.json(await Jogo.listarPontuacao(idjogo));
}));

router.all("/listarPontuacaoData", wrap(async (req: express.Request, res: express.Response) => {
	allowCors(res);
	let idjogo = parseInt(req.query["idjogo"]);
	let dataInicial = (req.query["data"] || req.query["dataInicial"]) as string;
	let dataFinal = req.query["dataFinal"] as string;
	if (isNaN(idjogo) || idjogo <= 0 || !dataISOValida(dataInicial) || (dataFinal && !dataISOValida(dataFinal)))
		jsonRes(res, 400, "Dados inválidos!");
	else
		res.json(await Jogo.listarPontuacaoData(idjogo, dataInicial, dataFinal));
}));

export = router;
