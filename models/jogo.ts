import Sql = require("../infra/sql");

export = class Jogo {
	public id: number;
	public idusuario: number;
	public nome: string;
	public token: string;
	public url_externa: string;
	public data_cadastro: string;
	public ordem: number;

	private static validar(j: Jogo): string {
		j.nome = (j.nome || "").normalize().trim();
		if (j.nome.length < 2 || j.nome.length > 100)
			return "Nome inválido";
		j.token = (j.token || "").normalize().trim();
		if (j.token.length > 50)
			return "Token inválido";
		j.url_externa = (j.url_externa || "").normalize().trim();
		if (j.url_externa.length > 200)
			return "Token inválido";
		return null;
	}

	public static async listar(): Promise<Jogo[]> {
		let lista: Jogo[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id, idusuario, nome, token, url_externa, date_format(data_cadastro, '%d/%m/%Y') data_cadastro, ordem from jogo order by nome asc") as Jogo[];
		});

		return (lista || []);
	}

	public static async obter(id: number): Promise<Jogo> {
		let lista: Jogo[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id, idusuario, nome, token, url_externa, date_format(data_cadastro, '%d/%m/%Y') data_cadastro from jogo where id = ?", [id]) as Jogo[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(j: Jogo): Promise<string> {
		let res: string;
		if ((res = Jogo.validar(j)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into jogo (idusuario, nome, token, url_externa, data_cadastro, ordem) values (?, ?, ?, ?, now(), 0)", [j.idusuario, j.nome, j.token, j.url_externa]);
				res = (await sql.scalar("select last_insert_id()") as number).toString();
			} catch (e) {
				switch (e.code) {
					case "ER_DUP_ENTRY":
						res = "O jogo \"" + j.nome + "\" já existe";
						break;
					case "ER_NO_REFERENCED_ROW":
					case "ER_NO_REFERENCED_ROW_2":
						res = "Usuário não encontrado";
						break;
					default:
						throw e;
				}
			}
		});

		return res;
	}

	public static async alterar(j: Jogo): Promise<string> {
		let res: string;
		if ((res = Jogo.validar(j)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update jogo set nome = ?, token = ?, url_externa = ? where id = ?", [j.nome, j.token, j.url_externa, j.id]);
				res = sql.linhasAfetadas.toString();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = "O jogo \"" + j.nome + "\" já existe";
				else
					throw e;
			}
		});

		return res;
	}

	public static async excluir(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from jogo where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

	public static async listarPontuacao(id: number): Promise<any[]> {
		let res: any[] = null;

		await Sql.conectar(async (sql: Sql) => {
			res = await sql.query("select p.id, p.valor, jo.email, jo.nome, date_format(p.data, '%d/%m/%Y') dia, date_format(p.data, '%H:%i') hora from pontuacao p inner join jogador jo on jo.id = p.idjogador where p.idjogo = ? order by p.valor desc, p.id asc limit 100", [id]);
		});

		return res || [];
	}

	public static async listarPontuacaoData(id: number, dataInicial: string, dataFinal?: string): Promise<any[]> {
		let res: any[] = null;

		await Sql.conectar(async (sql: Sql) => {
			res = await sql.query("select p.id, p.valor, jo.email, jo.nome, date_format(p.data, '%d/%m/%Y') dia, date_format(p.data, '%H:%i') hora from pontuacao p inner join jogador jo on jo.id = p.idjogador where p.idjogo = ? and p.data between ? and ? order by p.valor desc, p.id asc", [id, dataInicial + " 00:00:00", (dataFinal || dataInicial) + " 23:59:59.9999"]);
		});

		return res || [];
	}
}
