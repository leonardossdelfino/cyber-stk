-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 15/02/2026 às 23:10
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `cyber-stk`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`, `criado_em`) VALUES
(2, 'Infraestrutura', '2026-02-15 13:53:39'),
(3, 'Marketing', '2026-02-15 13:53:39'),
(4, 'RH', '2026-02-15 13:53:39'),
(5, 'Facilities 1', '2026-02-15 13:53:39'),
(6, 'Jurídico', '2026-02-15 13:53:39'),
(7, 'Financeiro', '2026-02-15 13:53:39'),
(8, 'TI', '2026-02-15 14:00:02');

-- --------------------------------------------------------

--
-- Estrutura para tabela `contas_fixas`
--

CREATE TABLE `contas_fixas` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `fornecedor` varchar(100) NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `dia_vencimento` tinyint(4) NOT NULL COMMENT 'Dia do mês: 1-31',
  `dia_fechamento` tinyint(4) DEFAULT NULL COMMENT 'Dia do mês: 1-31',
  `forma_pagamento` varchar(50) NOT NULL DEFAULT 'Boleto',
  `categoria` varchar(100) NOT NULL DEFAULT 'Outros',
  `status` enum('Ativa','Inativa','Cancelada') NOT NULL DEFAULT 'Ativa',
  `observacoes` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `formas_pagamento`
--

CREATE TABLE `formas_pagamento` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `formas_pagamento`
--

INSERT INTO `formas_pagamento` (`id`, `nome`, `criado_em`) VALUES
(1, 'Boleto', '2026-02-15 13:53:39'),
(2, 'Cartão de Crédito', '2026-02-15 13:53:39'),
(4, 'Transferência', '2026-02-15 13:53:39'),
(5, 'Cheque', '2026-02-15 13:53:39'),
(6, 'PIX', '2026-02-15 14:00:23');

-- --------------------------------------------------------

--
-- Estrutura para tabela `fornecedores`
--

CREATE TABLE `fornecedores` (
  `id` int(11) NOT NULL,
  `razao_social` varchar(150) NOT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `contato` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `fornecedores`
--

INSERT INTO `fornecedores` (`id`, `razao_social`, `cnpj`, `contato`, `email`, `descricao`, `criado_em`) VALUES
(2, 'Apple', '00000000000', 'Leo', 'Leo@gmail.com', 'Teste apple', '2026-02-15 20:17:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `incidentes`
--

CREATE TABLE `incidentes` (
  `id` int(11) NOT NULL,
  `descricao` varchar(200) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `oc_documentos`
--

CREATE TABLE `oc_documentos` (
  `id` int(11) NOT NULL,
  `oc_id` int(11) NOT NULL,
  `nome_arquivo` varchar(255) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ordens_de_compra`
--

CREATE TABLE `ordens_de_compra` (
  `id` int(11) NOT NULL,
  `oc_numero` varchar(20) NOT NULL,
  `oc_descricao` text NOT NULL,
  `oc_nome_fornecedor` varchar(100) NOT NULL,
  `oc_valor` decimal(12,2) NOT NULL,
  `oc_status` enum('OC Aberta','Aguardando faturar','Aguardando cartão','Aguardando financeiro','Aguardando jurídico','Em transporte','Finalizado','Cancelado') NOT NULL DEFAULT 'OC Aberta',
  `oc_forma_pagamento` enum('Boleto','Cartão de crédito','Transferência','Pix','Outro') NOT NULL DEFAULT 'Boleto',
  `oc_aprovacao` enum('Sim','Não','Aguardando CEO','Aguardando Head','Aguardando aprovação') NOT NULL DEFAULT 'Aguardando aprovação',
  `oc_data_referencia` date NOT NULL,
  `oc_centro_de_custo` varchar(100) NOT NULL,
  `oc_solicitante` varchar(100) NOT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  `atualizado_em` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `ordens_de_compra`
--

INSERT INTO `ordens_de_compra` (`id`, `oc_numero`, `oc_descricao`, `oc_nome_fornecedor`, `oc_valor`, `oc_status`, `oc_forma_pagamento`, `oc_aprovacao`, `oc_data_referencia`, `oc_centro_de_custo`, `oc_solicitante`, `criado_em`, `atualizado_em`) VALUES
(4, '0004', 'Note', 'Apple', 100.00, 'Aguardando cartão', 'Cartão de crédito', '', '2026-02-15', 'Cyber', 'Leo', '2026-02-15 19:07:45', '2026-02-15 19:08:32');

-- --------------------------------------------------------

--
-- Estrutura para tabela `perifericos`
--

CREATE TABLE `perifericos` (
  `id` int(11) NOT NULL,
  `descricao` varchar(100) NOT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `valor_medio` decimal(10,2) DEFAULT NULL,
  `obs` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `status_aprovacao`
--

CREATE TABLE `status_aprovacao` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `status_aprovacao`
--

INSERT INTO `status_aprovacao` (`id`, `nome`, `criado_em`) VALUES
(1, 'Sim', '2026-02-15 13:53:39'),
(2, 'Não', '2026-02-15 13:53:39'),
(3, 'Pendente', '2026-02-15 13:53:39');

-- --------------------------------------------------------

--
-- Estrutura para tabela `status_oc`
--

CREATE TABLE `status_oc` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cor` varchar(7) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `status_oc`
--

INSERT INTO `status_oc` (`id`, `nome`, `cor`, `criado_em`) VALUES
(1, 'OC Aberta', '#1eff05', '2026-02-15 13:53:39'),
(2, 'Aguardando faturar', '#01c4e7', '2026-02-15 13:53:39'),
(3, 'Aguardando cartão', '#ff0571', '2026-02-15 13:53:39'),
(4, 'Aguardando financeiro', '#120052', '2026-02-15 13:53:39'),
(5, 'Aguardando jurídico', '#13a8fe', '2026-02-15 13:53:39'),
(6, 'Em transporte', '#888888', '2026-02-15 13:53:39'),
(7, 'Finalizado', '#4b5320', '2026-02-15 13:53:39'),
(8, 'Cancelado', '#dc143c', '2026-02-15 13:53:39');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `contas_fixas`
--
ALTER TABLE `contas_fixas`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `formas_pagamento`
--
ALTER TABLE `formas_pagamento`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `incidentes`
--
ALTER TABLE `incidentes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `oc_documentos`
--
ALTER TABLE `oc_documentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_oc_documentos_oc` (`oc_id`);

--
-- Índices de tabela `ordens_de_compra`
--
ALTER TABLE `ordens_de_compra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `oc_numero` (`oc_numero`);

--
-- Índices de tabela `perifericos`
--
ALTER TABLE `perifericos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `status_aprovacao`
--
ALTER TABLE `status_aprovacao`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `status_oc`
--
ALTER TABLE `status_oc`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `contas_fixas`
--
ALTER TABLE `contas_fixas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `formas_pagamento`
--
ALTER TABLE `formas_pagamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `incidentes`
--
ALTER TABLE `incidentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `oc_documentos`
--
ALTER TABLE `oc_documentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `ordens_de_compra`
--
ALTER TABLE `ordens_de_compra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `perifericos`
--
ALTER TABLE `perifericos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `status_aprovacao`
--
ALTER TABLE `status_aprovacao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `status_oc`
--
ALTER TABLE `status_oc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `oc_documentos`
--
ALTER TABLE `oc_documentos`
  ADD CONSTRAINT `fk_oc_documentos_oc` FOREIGN KEY (`oc_id`) REFERENCES `ordens_de_compra` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
