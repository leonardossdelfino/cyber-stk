<?php
// =============================================================
// ARQUIVO: /backend/config/database.php
// FUNÇÃO: Gerencia a conexão com o banco de dados MySQL
// Utiliza PDO - a forma mais segura e moderna de conectar ao MySQL em PHP
// =============================================================

class Database {

    // --- Configurações de conexão ---
    // ⚠️ ATENÇÃO: Substitua pelos seus dados reais da Hostinger
    private $host     = "localhost";              // Servidor do banco (na Hostinger é sempre localhost)
    private $db_name  = "u239500132_cyber_stk";   // Nome do seu banco (copie exatamente do phpMyAdmin)
    private $username = "u239500132_cyber_stk"; // Usuário do banco (criado na Hostinger)
    private $password = "3nPEpf>F";              // Senha do banco
    private $charset  = "utf8mb4";                // Charset para suporte a acentos

    // Armazena a conexão ativa (null enquanto não conectar)
    private $conn = null;

    // ---------------------------------------------------------
    // MÉTODO: getConnection()
    // Cria e retorna a conexão com o banco usando PDO
    // Se a conexão já existe, reutiliza a mesma (padrão Singleton)
    // ---------------------------------------------------------
    public function getConnection() {

        // Só conecta se ainda não houver conexão ativa
        if ($this->conn === null) {

            try {
                // DSN = Data Source Name — identifica o banco para o PDO
                $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";

                // Opções de configuração do PDO
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // Lança exceção em caso de erro
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // Retorna resultados como array associativo
                    PDO::ATTR_EMULATE_PREPARES   => false,                   // Usa prepared statements reais (mais seguro)
                ];

                // Cria a conexão
                $this->conn = new PDO($dsn, $this->username, $this->password, $options);

            } catch (PDOException $e) {
                // Em caso de erro, não exibe detalhes técnicos para o cliente
                // Apenas loga internamente e retorna mensagem genérica
                error_log("Erro de conexão com o banco: " . $e->getMessage());
                throw new Exception("Não foi possível conectar ao banco de dados.");
            }
        }

        return $this->conn;
    }
}