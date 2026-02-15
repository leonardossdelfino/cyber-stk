CREATE TABLE contas_fixas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    fornecedor VARCHAR(100) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    dia_vencimento TINYINT NOT NULL COMMENT 'Dia do mês: 1-31',
    dia_fechamento TINYINT NULL COMMENT 'Dia do mês: 1-31',
    forma_pagamento VARCHAR(50) NOT NULL DEFAULT 'Boleto',
    categoria VARCHAR(100) NOT NULL DEFAULT 'Outros',
    status ENUM('Ativa','Inativa','Cancelada') NOT NULL DEFAULT 'Ativa',
    observacoes TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;