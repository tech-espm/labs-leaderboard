import express = require("express");
import multer = require("multer");
import wrap = require("express-async-error-wrapper");
import dataISOValida = require("../../utils/dataISOValida");
import jsonRes = require("../../utils/jsonRes");
import allowCors = require("../../utils/allowCors");
import Usuario = require("../../models/usuario");
import Jogo = require("../../models/jogo");

const router = express.Router();

function validarArquivoImagem(arquivo: any): boolean {
	return (!arquivo || (arquivo.buffer && arquivo.size && arquivo.size <= Jogo.tamanhoMaximoImagemEmBytes));
}

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

router.post("/criar", multer().single("imagem"), wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let j = req.body as Jogo;
	if (j) {
		j.idusuario = u.id;
		j.tipo_pontuacao = parseInt(req.body.tipo_pontuacao);
	}
	jsonRes(res, 400, (j && req["file"] && validarArquivoImagem(req["file"])) ? await Jogo.criar(j, req["file"]) : "Dados inválidos!");
}));

router.post("/alterar", multer().single("imagem"), wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let j = req.body as Jogo;
	if (j) {
		j.id = parseInt(req.body.id);
		j.idusuario = j.id;
		j.tipo_pontuacao = parseInt(req.body.tipo_pontuacao);
	}
	jsonRes(res, 400, (j && !isNaN(j.id) && validarArquivoImagem(req["file"])) ? await Jogo.alterar(j, req["file"]) : "Dados inválidos!");
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
