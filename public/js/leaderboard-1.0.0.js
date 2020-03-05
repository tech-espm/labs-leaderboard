"use strict";

window.leaderboard = {
	root: "https://academico.espm.br/jogos",
	executando: false,
	jogador: function (callback) {
		if (leaderboard.executando)
			return false;
		try {
			var json = decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent("espmJogador").replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")),
				j = (json ? JSON.parse(json) : null);
			if (j && j.id && j.email && j.nome) {
				setTimeout(function () { callback(j); }, 10);
				return;
			}
		} catch (ex) {
		}
		var xhr = new XMLHttpRequest(), ok = false;
		xhr.onreadystatechange = function () {
			if (!ok && xhr.readyState === 4) {
				leaderboard.executando = false;
				ok = true;
				if (xhr.status === 200) {
					try {
						var j = JSON.parse(xhr.responseText);
						if (j && j.id && j.email && j.nome) {
							callback(j);
							return;
						}
					} catch (ex) {
					}
				}
				callback(null);
			}
		};
		xhr.open("get", leaderboard.root + "/api/jogador/cookie", true);
		leaderboard.executando = true;
		try {
			xhr.send();
		} catch (e) {
			leaderboard.executando = false;
			throw e;
		}
		return true;
	},
	login: function (url) {
		window.location.href = leaderboard.root + "/jogador?callback=" + encodeURIComponent(url || window.location.href);
	},
	abrir: function (idjogo) {
		if (idjogo && idjogo > 0)
			window.open(leaderboard.root + "/jogo/" + idjogo);
	},
	marcar: function (jogador, idjogo, token, valor, callback) {
		if (leaderboard.executando || !jogador || !jogador.id || !idjogo || idjogo <= 0 || !token || isNaN(valor))
			return false;
		var xhr = new XMLHttpRequest(), ok = false;
		xhr.onreadystatechange = function () {
			if (!ok && xhr.readyState === 4) {
				leaderboard.executando = false;
				ok = true;
				if (callback)
					callback(xhr.status >= 200 && xhr.status <= 299);
			}
		};
		xhr.open("get", leaderboard.root + "/api/jogador/marcar?idjogador=" + jogador.id + "&idjogo=" + idjogo + "&token=" + encodeURIComponent(token) + "&valor=" + valor, true);
		leaderboard.executando = true;
		try {
			xhr.send();
		} catch (e) {
			leaderboard.executando = false;
			throw e;
		}
		return true;
	}
};
