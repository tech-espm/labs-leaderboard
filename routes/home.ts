﻿import express = require("express");
import wrap = require("express-async-error-wrapper");
import Usuario = require("../models/usuario");
import Jogo = require("../models/jogo");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.render("home/index", { layout: "layout-externo", imagemFundo: true, lista: await Jogo.listar() });
	else
		res.render("home/dashboard", { usuario: u });
}));

router.all("/login", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		let mensagem: string = null;
		if (req.body.login || req.body.senha) {
			[mensagem, u] = await Usuario.efetuarLogin(req.body.login as string, req.body.senha as string, null, res);
			if (mensagem)
				res.render("home/login", { layout: "layout-externo", imagemFundo: true, mensagem: mensagem, loginUrl: appsettings.loginUrl });
			else
				res.redirect(appsettings.root + "/");
		} else {
			res.render("home/login", { layout: "layout-externo", imagemFundo: true, mensagem: null, loginUrl: appsettings.loginUrl });
		}
	} else {
		res.redirect(appsettings.root + "/");
	}
}));

router.get("/acesso", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/");
	} else {
		res.render("home/acesso", { titulo: "Sem Permissão", usuario: u });
	}
}));

router.get("/perfil", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/");
	} else {
		res.render("home/perfil", { titulo: "Meu Perfil", usuario: u });
	}
}));

router.get("/logout", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (u)
		await u.efetuarLogout(res);
	res.redirect(appsettings.root + "/");
}));

export = router;