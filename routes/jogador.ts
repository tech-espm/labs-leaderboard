import express = require("express");
import wrap = require("express-async-error-wrapper");
import Usuario = require("../models/usuario");
import Jogo = require("../models/jogo");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/", wrap(async (req: express.Request, res: express.Response) => {
	res.render("jogador/login", { layout: "layout-externo", imagemFundo: true, criacao: false, callback: req.query["callback"] });
}));

router.all("/registro", wrap(async (req: express.Request, res: express.Response) => {
	res.render("jogador/login", { layout: "layout-externo", imagemFundo: true, criacao: true, callback: req.query["callback"] });
}));

export = router;
