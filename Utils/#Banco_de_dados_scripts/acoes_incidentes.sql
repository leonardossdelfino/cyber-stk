CREATE TABLE acoes_incidente (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    nome      VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserindo as ações padrão
INSERT INTO acoes_incidente (nome) VALUES
('Troca'),
('Reparo'),
('Sem substituição');