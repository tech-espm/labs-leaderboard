import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import allowCors = require("../../utils/allowCors");
import Usuario = require("../../models/usuario");
import Jogador = require("../../models/jogador");

const router = express.Router();

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	res.json(await Jogador.listar());
}));

router.post("/login", wrap(async (req: express.Request, res: express.Response) => {
	let j = req.body as Jogador;
	jsonRes(res, 400, j ? await Jogador.login(res, j, req.query["criacao"] === "1") : "Dados inválidos!");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id"]);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos!" : await Jogador.excluir(id));
}));

router.all("/cookie", wrap(async (req: express.Request, res: express.Response) => {
	allowCors(res);
	res.json(Jogador.cookie(req));
}));

router.all("/marcar", wrap(async (req: express.Request, res: express.Response) => {
	allowCors(res);
	let idjogador = parseInt(req.query["idjogador"]);
	let idjogo = parseInt(req.query["idjogo"]);
	let token = req.query["token"] as string;
	let valor = parseFloat((req.query["valor"] as string || "").replace(",", "."));
	jsonRes(res, 400, (isNaN(idjogador) || idjogador <= 0 || isNaN(idjogo) || idjogo <= 0 || !token || isNaN(valor)) ? "Dados inválidos!" : await Jogador.marcar(idjogador, idjogo, token, valor));
}));

export = router;
