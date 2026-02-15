-- =============================================
-- ETAPA 6 — Tabelas de Configurações
-- Banco: cyber-stk
-- =============================================

-- Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20),
    contato VARCHAR(100),
    email VARCHAR(100),
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Formas de Pagamento
CREATE TABLE IF NOT EXISTS formas_pagamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Status de Aprovação
CREATE TABLE IF NOT EXISTS status_aprovacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Status da OC
CREATE TABLE IF NOT EXISTS status_oc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(7),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Periféricos
CREATE TABLE IF NOT EXISTS perifericos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    marca VARCHAR(100),
    valor_medio DECIMAL(10,2),
    obs TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Dados iniciais (os que já existem no sistema)
-- =============================================

INSERT INTO categorias (nome) VALUES
('TI'), ('Infraestrutura'), ('Marketing'), ('RH'), ('Facilities'), ('Jurídico'), ('Financeiro');

INSERT INTO formas_pagamento (nome) VALUES
('Boleto'), ('Cartão de Crédito'), ('PIX'), ('Transferência'), ('Cheque');

INSERT INTO status_aprovacao (nome) VALUES
('Sim'), ('Não'), ('Pendente');

INSERT INTO status_oc (nome, cor) VALUES
('OC Aberta',             '#1eff05'),
('Aguardando faturar',    '#01c4e7'),
('Aguardando cartão',     '#ff0571'),
('Aguardando financeiro', '#120052'),
('Aguardando jurídico',   '#13a8fe'),
('Em transporte',         '#888888'),
('Finalizado',            '#4b5320'),
('Cancelado',             '#dc143c');