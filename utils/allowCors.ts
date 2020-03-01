import express = require("express");

export = function allowCors(res: express.Response) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "HEAD, GET, POST, OPTIONS, PUT, PATCH, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
	res.setHeader("Access-Control-Allow-Credentials", "true");
}
