CREATE DATABASE Uniride;

USE Uniride;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    nascimento DATE,
    motorista TINYINT NULL
);

CREATE TABLE motorista (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cpf VARCHAR(14),
    dataVencimento DATE,
    numeroRegistro VARCHAR(20),
    usuario_id INT,

    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);

CREATE TABLE viagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100),
    descricao TEXT NULL,
    pontoPartida VARCHAR(100),
    pontoChegada VARCHAR(100),
    dataHora DATETIME,
    preco INT NULL,
    tipoCarona VARCHAR(50) NULL,
    usuario_id INT,

    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);

CREATE TABLE veiculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    ano INT,
    cor VARCHAR(30),
    renavam VARCHAR(20),
    capacidade INT,
    gastoCombustivel DECIMAL(5,2),
    categoria VARCHAR(20),
    usuario_id INT,

    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);