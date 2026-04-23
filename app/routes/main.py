from functools import wraps
from flask import render_template, redirect, session, url_for, Blueprint
from db import get_connection

# Blueprint responsável pelas rotas principais de páginas do sistema
main_bp = Blueprint('main', __name__)


def login_required(view_func):
    """
    Decorador para proteger rotas que exigem autenticação.

    Se o usuário não estiver logado, ele é redirecionado
    para a página inicial do sistema.
    """
    @wraps(view_func)
    def wrapped_view(*args, **kwargs):
        # Verifica se existe um usuário autenticado na sessão
        if "user_id" not in session:
            return redirect(url_for("main.index"))

        # Caso esteja autenticado, permite o acesso à rota normalmente
        return view_func(*args, **kwargs)

    return wrapped_view


@main_bp.route("/")
def index():
    """
    Renderiza a página inicial do sistema.

    Nesta rota são carregados:
    - os cursos cadastrados
    - os PPCs cadastrados
    - as informações básicas da sessão do usuário, caso exista login ativo
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            # Busca todos os cursos disponíveis para exibição na tela inicial
            cur.execute("""
                SELECT id, nome
                FROM cursos
                ORDER BY nome
            """)
            cursos = cur.fetchall()

            # Busca todos os PPCs vinculados aos cursos
            # junto com o nome do curso correspondente
            cur.execute("""
                SELECT
                    p.id,
                    p.codigo,
                    p.curso_id,
                    c.nome AS curso_nome
                FROM ppcs p
                JOIN cursos c ON c.id = p.curso_id
                ORDER BY c.nome, p.codigo
            """)
            ppcs = cur.fetchall()

    # Renderiza a página inicial enviando os dados necessários ao template
    return render_template(
        "index.html",
        cursos=cursos,
        ppcs=ppcs,
        usuario_logado=("user_id" in session),
        user_name=session.get("user_name", "")
    )


@main_bp.route("/grade")
@login_required
def grade():
    """
    Renderiza a página de geração/visualização de grade.

    Esta rota é protegida por autenticação e só pode ser acessada
    por usuários logados.
    """
    return render_template(
        "grade.html",
        user_name=session.get("user_name", "Usuário")
    )


@main_bp.route("/historico-disciplinas")
def historico_disciplinas():
    """
    Renderiza a página de histórico de disciplinas.

    Caso exista um usuário logado, o nome dele é enviado ao template.
    Caso contrário, é utilizado o valor padrão 'Usuário'.
    """
    user_name = session.get("user_name", "Usuário")
    return render_template("historico_disciplinas.html", user_name=user_name)