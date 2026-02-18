ALTER TABLE registros_perdas
ADD COLUMN custo DECIMAL(10,2) NULL COMMENT 'Custo do incidente' AFTER descricao;