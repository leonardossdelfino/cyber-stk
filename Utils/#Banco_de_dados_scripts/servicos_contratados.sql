CREATE TABLE servicos_contratados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    fornecedor VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL DEFAULT 'Outros',
    forma_pagamento VARCHAR(100) NOT NULL DEFAULT 'Boleto',
    descricao TEXT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    data_inicio DATE NOT NULL,
    data_termino DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Ativa',
    arquivo_contrato VARCHAR(255) NULL COMMENT 'Nome do arquivo salvo em uploads/contratos/',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;