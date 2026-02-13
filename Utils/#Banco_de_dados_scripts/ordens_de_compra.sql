-- =============================================
-- TABELA: ordens_de_compra
-- Armazena todas as Ordens de Compra do sistema
-- =============================================
CREATE TABLE ordens_de_compra (

  -- Identificador único gerado automaticamente pelo banco
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Número da OC no sistema financeiro (ex: 1284065821)
  oc_numero VARCHAR(20) NOT NULL UNIQUE,

  -- Descrição detalhada do que está sendo comprado
  oc_descricao TEXT NOT NULL,

  -- Nome comercial do fornecedor (ex: Apple, Worldzone)
  oc_nome_fornecedor VARCHAR(100) NOT NULL,

  -- Valor total da OC em reais
  oc_valor DECIMAL(12, 2) NOT NULL,

  -- Status atual da OC no processo
  oc_status ENUM(
    'OC Aberta',
    'Aguardando faturar',
    'Aguardando cartão',
    'Aguardando financeiro',
    'Aguardando jurídico',
    'Em transporte',
    'Finalizado',
    'Cancelado'
  ) NOT NULL DEFAULT 'OC Aberta',

  -- Forma de pagamento utilizada
  oc_forma_pagamento ENUM(
    'Boleto',
    'Cartão de crédito',
    'Transferência',
    'Pix',
    'Outro'
  ) NOT NULL DEFAULT 'Boleto',

  -- Status da aprovação da OC
  oc_aprovacao ENUM(
    'Sim',
    'Não',
    'Aguardando CEO',
    'Aguardando Head',
    'Aguardando aprovação'
  ) NOT NULL DEFAULT 'Aguardando aprovação',

  -- Data de referência da OC (armazenado como DATE para permitir ordenação e filtros)
  -- No frontend será exibido como "Janeiro/2026", mas o banco guarda "2026-01-01"
  oc_data_referencia DATE NOT NULL,

  -- Centro de custo / área responsável pela OC
  oc_centro_de_custo VARCHAR(100) NOT NULL,

  -- Nome do solicitante da OC
  oc_solicitante VARCHAR(100) NOT NULL,

  -- Timestamps automáticos de controle
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

-- Charset utf8mb4 garante suporte completo a acentos e caracteres especiais
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;