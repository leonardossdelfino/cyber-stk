CREATE TABLE oc_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    oc_id INT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_oc_documentos_oc
        FOREIGN KEY (oc_id) 
        REFERENCES ordens_de_compra(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;