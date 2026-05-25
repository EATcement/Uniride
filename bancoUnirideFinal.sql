CREATE DATABASE IF NOT EXISTS Uniride;
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

CREATE TABLE solicitacao_viagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viagem_id INT NOT NULL,
    passageiro_id INT NOT NULL,
    status ENUM('pendente', 'aceito', 'recusado') DEFAULT 'pendente',
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (viagem_id) REFERENCES viagem(id) ON DELETE CASCADE,
    FOREIGN KEY (passageiro_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

ALTER TABLE solicitacao_viagem 
    ADD COLUMN tipo_vaga ENUM('passageiro', 'motorista') DEFAULT 'passageiro';

-- ════════════════════════════════════════
-- TABELAS EXISTENTES — apenas alterações
-- ════════════════════════════════════════

-- usuario: adicionar status
ALTER TABLE usuario
    ADD COLUMN status ENUM('ativo', 'banido') DEFAULT 'ativo';

-- viagem → renomeada para grupo_viagem
RENAME TABLE viagem TO grupo_viagem;

-- grupo_viagem: ajustes nos atributos
ALTER TABLE grupo_viagem
    MODIFY COLUMN preco DECIMAL(10,2) NULL,
    ADD COLUMN tipoRecorrencia ENUM('avulsa', 'recorrente') DEFAULT 'avulsa';

-- ════════════════════════════════════════
-- TABELAS NOVAS
-- ════════════════════════════════════════

CREATE TABLE administrador (
    id_adm INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE viagem_recorrencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana TINYINT,
    hora TIME,
    data_inicio DATE,
    viagem_id INT,

    FOREIGN KEY (viagem_id) REFERENCES grupo_viagem(id) ON DELETE CASCADE
);

CREATE TABLE viagem_instancia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE,
    hora TIME NULL,
    status ENUM('pendente', 'iniciada', 'finalizada', 'nao_ocorrida') DEFAULT 'pendente',
    viagem_id INT,
    viagem_recorrencia_id INT NULL,

    FOREIGN KEY (viagem_id) REFERENCES grupo_viagem(id) ON DELETE CASCADE,
    FOREIGN KEY (viagem_recorrencia_id) REFERENCES viagem_recorrencia(id) ON DELETE SET NULL
);

CREATE TABLE participante_instancia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viagem_instancia_id INT,
    usuario_id INT,

    FOREIGN KEY (viagem_instancia_id) REFERENCES viagem_instancia(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE avaliacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('avaliacao', 'denuncia') DEFAULT 'avaliacao',
    tipo_vaga ENUM('motorista', 'passageiro'),
    nota TINYINT,
    comentario TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avaliador_id INT,
    avaliado_id INT,
    viagem_instancia_id INT,

    FOREIGN KEY (avaliador_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (avaliado_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (viagem_instancia_id) REFERENCES viagem_instancia(id) ON DELETE CASCADE
);

CREATE TABLE banimento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    motivo TEXT NULL,
    banido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    banido_ate DATETIME NULL,
    usuario_id INT,
    admin_id INT,
    avaliacao_id INT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES administrador(id_adm) ON DELETE CASCADE,
    FOREIGN KEY (avaliacao_id) REFERENCES avaliacao(id) ON DELETE SET NULL
);

CREATE TABLE mensagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conteudo TEXT NOT NULL,
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viagem_id INT,
    usuario_id INT,

    FOREIGN KEY (viagem_id) REFERENCES grupo_viagem(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Alterações tabelas para adicionar no modelo lógico e conceitual:

ALTER TABLE grupo_viagem
    ADD COLUMN capacidade INT NULL COMMENT 'Limite de passageiros no grupo',
    ADD COLUMN veiculo_id INT NULL COMMENT 'Veículo que será usado na viagem',
    ADD CONSTRAINT fk_grupo_veiculo
        FOREIGN KEY (veiculo_id) REFERENCES veiculo(id) ON DELETE SET NULL;

--
ALTER TABLE usuario ADD COLUMN foto_perfil VARCHAR(255) NULL;
INSERT INTO administrador (nome, email, senha) VALUES ('Admin', 'admin@pucpr.edu.br', 'admin123');
