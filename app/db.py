import psycopg
from psycopg.rows import dict_row

# Configurações de conexão com o banco de dados PostgreSQL
DB_CONFIG = {
    "host": "localhost",
    "dbname": "sistema_matricula",
    "user": "postgres",
    "password": "1234",
    "port": 5432,
}


def get_connection():
    """
    Cria e retorna uma nova conexão com o banco de dados.

    A conexão utiliza dict_row para que os resultados das consultas
    sejam retornados como dicionários, facilitando o acesso aos campos
    pelo nome das colunas.
    """
    return psycopg.connect(
        host=DB_CONFIG["host"],
        dbname=DB_CONFIG["dbname"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        port=DB_CONFIG["port"],
        row_factory=dict_row,
    )