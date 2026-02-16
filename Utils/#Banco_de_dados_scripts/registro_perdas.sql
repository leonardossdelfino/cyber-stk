CREATE TABLE registros_perdas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    tipo            VARCHAR(50)  NOT NULL,
    nome_pessoa     VARCHAR(100) NOT NULL,
    area            VARCHAR(100) NOT NULL,
    periferico      VARCHAR(150) NULL COMMENT 'Nome do periférico entregue',
    descricao       TEXT         NULL,
    acao_tomada     VARCHAR(50)  NOT NULL,
    data_incidente  DATE         NOT NULL,
    criado_em       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;