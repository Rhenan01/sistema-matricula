import os
import psycopg
from psycopg.rows import dict_row


# Configuração local, usada quando você roda no seu computador
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "dbname": os.getenv("DB_NAME", "sistema_matricula"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "1234"),
    "port": os.getenv("DB_PORT", "5432"),
}


def get_connection():
    """
    Cria e retorna uma nova conexão com o banco de dados.

    Localmente, usa o PostgreSQL instalado no computador.
    No Render, usa a variável DATABASE_URL apontando para o banco online.
    """
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        return psycopg.connect(
            database_url,
            row_factory=dict_row
        )

    return psycopg.connect(
        host=DB_CONFIG["host"],
        dbname=DB_CONFIG["dbname"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        port=DB_CONFIG["port"],
        row_factory=dict_row,
    )