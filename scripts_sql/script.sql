CREATE DATABASE IF NOT EXISTS leaderboard;
USE leaderboard;

-- DROP TABLE IF EXISTS usuario;
CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  login varchar(50) NOT NULL,
  nome varchar(100) NOT NULL,
  tipo int NOT NULL,
  senha varchar(100) NOT NULL,
  token char(32) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY login_UN (login)
);

INSERT INTO usuario (login, nome, tipo, senha, token) VALUES ('ADMIN', 'ADMINISTRADOR', 0, 'peTcC99vkvvLqGQL7mdhGuJZIvL2iMEqvCNvZw3475PJ:JVyo1Pg2HyDyw9aSOd3gNPT30KdEyiUYCjs7RUzSoYGN', NULL);

-- DROP TABLE IF EXISTS jogo;
CREATE TABLE jogo (
  id int NOT NULL AUTO_INCREMENT,
  idusuario int NOT NULL,
  nome varchar(100) NOT NULL,
  token varchar(50) NOT NULL,
  url_externa varchar(200) NOT NULL,
  data_cadastro datetime NOT NULL,
  ordem int NOT NULL,
  PRIMARY KEY (id),
  KEY idusuario_FK_idx (idusuario),
  UNIQUE KEY nome_UN (nome),
  CONSTRAINT idusuario_FK FOREIGN KEY (idusuario) REFERENCES usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS jogador;
CREATE TABLE jogador (
  id int NOT NULL AUTO_INCREMENT,
  email varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  data_cadastro datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email_UN (email)
);

-- DROP TABLE IF EXISTS pontuacao;
CREATE TABLE pontuacao (
  id bigint NOT NULL AUTO_INCREMENT,
  idjogo int NOT NULL,
  idjogador int NOT NULL,
  valor bigint NOT NULL,
  data datetime NOT NULL,
  PRIMARY KEY (id),
  KEY idjogo_data_idx (idjogo, data),
  KEY idjogo_valor_idx (idjogo, valor),
  KEY idjogador_FK_idx (idjogador),
  CONSTRAINT idjogo_FK FOREIGN KEY (idjogo) REFERENCES jogo (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT idjogador_FK FOREIGN KEY (idjogador) REFERENCES jogador (id) ON DELETE CASCADE ON UPDATE CASCADE
);
