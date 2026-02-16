CREATE TABLE certificados_digitais (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(150)  NOT NULL,
    tipo         VARCHAR(50)   NOT NULL,
    responsavel  VARCHAR(100)  NULL,
    area         VARCHAR(100)  NULL,
    descricao    TEXT          NULL,
    data_emissao DATE          NULL,
    data_vencimento DATE       NOT NULL,
    status       VARCHAR(50)   NOT NULL DEFAULT 'Ativo',
    criado_em    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;