import express = require("express");
import emailValido = require("../utils/emailValido");
import Sql = require("../infra/sql");

export = class Jogador {
	public id: number;
	public email: string;
	public nome: string;
	public data_cadastro: string;

	public static cookie(req: express.Request): Jogador {
		try {
			let cookieStr = req.cookies["espmJogador"] as string;
			if (cookieStr) {
				let j = JSON.parse(cookieStr) as Jogador;
				if (j && j.id && j.email && j.nome)
					return j;
			}
		} catch (ex) {
		}
		return null;
	}

	private static validar(j: Jogador, criacao: boolean): string {
		if (criacao) {
			j.nome = (j.nome || "").normalize().trim();
			if (j.nome.length < 3 || j.nome.length > 100)
				return "Nome inválido";
		}
		j.email = (j.email || "").normalize().trim().toLowerCase();
		if (j.email.length < 4 || j.email.length > 100 || !emailValido(j.email))
			return "E-mail inválido";
		return null;
	}

	public static async listar(): Promise<Jogador[]> {
		let lista: Jogador[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id, email, nome, date_format(data_cadastro, '%d/%m/%Y') data_cadastro from jogador") as Jogador[];
		});

		return (lista || []);
	}

	public static async login(res: express.Response, j: Jogador, criacao: boolean): Promise<string> {
		let r: string;
		if ((r = Jogador.validar(j, criacao)))
			return r;

		await Sql.conectar(async (sql: Sql) => {
			try {
				if (criacao) {
					await sql.query("insert into jogador (email, nome, data_cadastro) values (?, ?, now())", [j.email, j.nome]);
					j.id = await sql.scalar("select last_insert_id()") as number;
				} else {
					let lista = await sql.query("select id, nome from jogador where email = ?", [j.email]) as Jogador[];
					if (!lista || !lista.length) {
						r = "E-mail não encontrado \uD83D\uDE22";
						return;
					}
					j.id = lista[0].id;
					j.nome = lista[0].nome;
				}
				res.cookie("espmJogador", JSON.stringify({ id: j.id, email: j.email, nome: j.nome }), { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: "none", secure: true });
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					r = "O e-mail \"" + j.email + "\" já estava cadastrado \uD83D\uDE22";
				else
					throw e;
			}
		});

		return r;
	}

	public static async excluir(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from jogador where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

	public static async marcar(id: number, idjogo: number, token: string, valor: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			try {
				let t = await sql.scalar("select token from jogo where id = ?", [idjogo]) as string;
				if (!t || t !== token) {
					res = "Jogo não encontrado ou token inválido";
					return;
				}
				await sql.query("insert into pontuacao (idjogo, idjogador, valor, data) values (?, ?, ?, now())", [idjogo, id, valor]);
			} catch (e) {
				switch (e.code) {
					case "ER_NO_REFERENCED_ROW":
					case "ER_NO_REFERENCED_ROW_2":
						res = "Jogador ou jogo não encontrado";
						break;
					default:
						throw e;
				}
			}
		});

		return res;
	}
}
