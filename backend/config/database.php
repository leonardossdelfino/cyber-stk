<?php
// =============================================================
// ARQUIVO: /backend/config/database.php
// FUNÇÃO: Gerencia a conexão com o banco de dados MySQL
//
// CREDENCIAIS: lidas de variáveis de ambiente quando disponíveis
// Fallback para valores locais (desenvolvimento com XAMPP)
// Em produção (Hostinger): configure as variáveis de ambiente
// no painel e remova os valores de fallback
// =============================================================

class Database {

    private $host;
    private $db_name;
    private $username;
    private $password;
    private $charset = "utf8mb4";
    private $conn    = null;

    public function __construct() {
        // getenv() lê variável de ambiente do servidor
        // ?: "fallback" é usado quando a variável não está definida (XAMPP local)
        // Em produção: configure as variáveis no painel da Hostinger
        $this->host     = getenv("DB_HOST")     ?: "localhost";
        $this->db_name  = getenv("DB_NAME")     ?: "cyber-stk";
        $this->username = getenv("DB_USER")     ?: "root";
        $this->password = getenv("DB_PASSWORD") ?: "";
    }

    // ---------------------------------------------------------
    // MÉTODO: getConnection()
    // Cria e retorna a conexão PDO — reutiliza se já existir
    // ---------------------------------------------------------
    public function getConnection() {

        if ($this->conn !== null) {
            return $this->conn;
        }

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";

            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);

        } catch (PDOException $e) {
            error_log("Erro de conexão com o banco: " . $e->getMessage());
            throw new Exception("Não foi possível conectar ao banco de dados.");
        }

        return $this->conn;
    }
}
