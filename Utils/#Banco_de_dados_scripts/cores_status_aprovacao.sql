ALTER TABLE status_aprovacao ADD COLUMN cor VARCHAR(7) DEFAULT '#ff0571';

UPDATE status_aprovacao SET cor = '#ff6ba8' WHERE nome = 'Não';
UPDATE status_aprovacao SET cor = '#ffa300' WHERE nome = 'Pendente';
UPDATE status_aprovacao SET cor = '#c2ff05' WHERE nome = 'Sim';