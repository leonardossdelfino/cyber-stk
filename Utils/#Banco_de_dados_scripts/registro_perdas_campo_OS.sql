ALTER TABLE registros_perdas
ADD COLUMN chamado_os VARCHAR(100) NULL COMMENT 'Número do chamado ou ordem de serviço' AFTER area;