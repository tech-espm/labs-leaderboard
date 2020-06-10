import Sql = require("../infra/sql");
import FS = require("../infra/fs");
import Upload = require("../infra/upload");

export = class Jogo {
	public static readonly tamanhoMaximoImagemEmKiB = 512;
	public static readonly tamanhoMaximoImagemEmBytes = Jogo.tamanhoMaximoImagemEmKiB << 10;
	public static readonly caminhoRelativoExterno = "screenshots";
	public static readonly caminhoRelativoPasta = "public/" + Jogo.caminhoRelativoExterno;
	public static readonly extensaoImagem = "jpg";

	public id: number;
	public idusuario: number;
	public nome: string;
	public token: string;
	public url_externa: string;
	public url_repositorio: string;
	public data_cadastro: string;
	public ordem: number;
	public tipo_pontuacao: number;
	public versao: number;

	private static caminhoRelativoArquivo(id: number): string {
		return `${Jogo.caminhoRelativoPasta}/${id}.${Jogo.extensaoImagem}`;
	}

	private static validar(j: Jogo): string {
		j.nome = (j.nome || "").normalize().trim();
		if (j.nome.length < 2 || j.nome.length > 100)
			return "Nome inválido";
		j.token = (j.token || "").normalize().trim();
		if (j.token.length > 50)
			return "Token inválido";
		j.url_externa = (j.url_externa || "").normalize().trim();
		if (j.url_externa.length > 200)
			return "URL externa inválida";
		j.url_repositorio = (j.url_repositorio || "").normalize().trim();
		if (j.url_repositorio.length > 200)
			return "URL do repositório inválida";
		if (isNaN(j.tipo_pontuacao) || j.tipo_pontuacao < 0)
		return "Tipo de pontuação inválido";
		return null;
	}

	public static async listar(): Promise<Jogo[]> {
		let lista: Jogo[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id, idusuario, nome, token, url_externa, url_repositorio, date_format(data_cadastro, '%d/%m/%Y') data_cadastro, ordem, tipo_pontuacao, versao from jogo order by ordem asc") as Jogo[];
		});

		return (lista || []);
	}

	public static async obter(id: number): Promise<Jogo> {
		let lista: Jogo[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id, idusuario, nome, token, url_externa, url_repositorio, date_format(data_cadastro, '%d/%m/%Y') data_cadastro, ordem, tipo_pontuacao, versao from jogo where id = ?", [id]) as Jogo[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(j: Jogo, arquivo: any): Promise<string> {
		let res: string;
		if ((res = Jogo.validar(j)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.beginTransaction();

				await sql.query("insert into jogo (idusuario, nome, token, url_externa, url_repositorio, data_cadastro, ordem, tipo_pontuacao, versao) values (?, ?, ?, ?, ?, now(), 0, ?, 0)", [j.idusuario, j.nome, j.token, j.url_externa, j.url_repositorio, j.tipo_pontuacao]);
				j.id = await sql.scalar("select last_insert_id()") as number;

				// Chegando aqui, significa que a inclusão foi bem sucedida.
				// Logo, podemos tentar criar o arquivo físico. Se a criação do
				// arquivo não funcionar, uma exceção ocorrerá, e a transação será
				// desfeita, já que o método commit() não executará, e nossa classe
				// Sql já executa um rollback() por nós nesses casos.
				await Upload.gravarArquivo(arquivo, Jogo.caminhoRelativoPasta, j.id + "." + Jogo.extensaoImagem);

				res = j.id.toString();

				await sql.commit();
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

	public static async alterar(j: Jogo, arquivo: any): Promise<string> {
		let res: string;
		if ((res = Jogo.validar(j)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.beginTransaction();

				await sql.query("update jogo set nome = ?, token = ?, url_externa = ?, url_repositorio = ?, tipo_pontuacao = ?, versao = versao + 1 where id = ?", [j.nome, j.token, j.url_externa, j.url_repositorio, j.tipo_pontuacao, j.id]);

				if (sql.linhasAfetadas && arquivo && arquivo.buffer && arquivo.size) {
					// Chegando aqui, significa que a inclusão foi bem sucedida.
					// Logo, podemos tentar criar o arquivo físico. Se a criação do
					// arquivo não funcionar, uma exceção ocorrerá, e a transação será
					// desfeita, já que o método commit() não executará, e nossa classe
					// Sql já executa um rollback() por nós nesses casos.
					await Upload.gravarArquivo(arquivo, Jogo.caminhoRelativoPasta, j.id + "." + Jogo.extensaoImagem);
				}

				res = sql.linhasAfetadas.toString();

				await sql.commit();
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
			await sql.beginTransaction();

			await sql.query("delete from jogo where id = ?", [id]);

			if (sql.linhasAfetadas) {
				// Chegando aqui, significa que a exclusão foi bem sucedida.
				// Logo, podemos tentar excluir o arquivo físico. Se a exclusão do
				// arquivo não funcionar, uma exceção ocorrerá, e a transação será
				// desfeita, já que o método commit() não executará, e nossa classe
				// Sql já executa um rollback() por nós nesses casos.
				let caminho = Jogo.caminhoRelativoArquivo(id);
				if (await FS.existeArquivo(caminho))
					await FS.excluirArquivo(caminho);
			}

			res = sql.linhasAfetadas.toString();

			await sql.commit();
		});

		return res;
	}

	public static async salvarOrdem(ids: number[]): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.beginTransaction();

			for (let i = 0; i < ids.length; i++) {
				await sql.query("update jogo set ordem = ? where id = ?", [i + 1, ids[i]]);
				if (!sql.linhasAfetadas) {
					res = `Jogo com id ${ids[i]} não encontrado`;
					return;
				}
			}

			await sql.commit();
		});

		return res;
	}

	private static async ordemPontuacao(sql: Sql, id: number): Promise<string> {
		const tipo_pontuacao: number = await sql.scalar("select tipo_pontuacao from jogo where id = ?", [id]);
		return (tipo_pontuacao ? ((tipo_pontuacao & 1) ? "desc" : "asc") : null);
	}

	public static async listarPontuacao(id: number): Promise<any[]> {
		let res: any[] = null;

		await Sql.conectar(async (sql: Sql) => {
			const ordem = await Jogo.ordemPontuacao(sql, id);

			res = await sql.query(`select p.id, p.valor, jo.email, jo.nome, date_format(p.data, '%d/%m/%Y') dia, date_format(p.data, '%H:%i') hora from pontuacao p inner join jogador jo on jo.id = p.idjogador where p.idjogo = ? order by p.valor ${ordem}, p.id asc limit 100`, [id]);
		});

		return res || [];
	}

	public static async listarPontuacaoData(id: number, dataInicial: string, dataFinal?: string): Promise<any[]> {
		let res: any[] = null;

		await Sql.conectar(async (sql: Sql) => {
			const ordem = await Jogo.ordemPontuacao(sql, id);

			res = await sql.query(`select p.id, p.valor, jo.email, jo.nome, date_format(p.data, '%d/%m/%Y') dia, date_format(p.data, '%H:%i') hora from pontuacao p inner join jogador jo on jo.id = p.idjogador where p.idjogo = ? and p.data between ? and ? order by p.valor ${ordem}, p.id asc`, [id, dataInicial + " 00:00:00", (dataFinal || dataInicial) + " 23:59:59.9999"]);
		});

		return res || [];
	}
}
