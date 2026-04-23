from flask import request, redirect, session, url_for, flash, Blueprint
from werkzeug.security import generate_password_hash, check_password_hash
from psycopg.errors import UniqueViolation
from db import get_connection

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Realiza o cadastro de um novo usuário no sistema.
    """
    name = request.form.get("name", "").strip()
    registration = request.form.get("registration", "").strip()
    email = request.form.get("email", "").strip()
    course_id = request.form.get("course_id")
    ppc_id = request.form.get("ppc_id")
    password = request.form.get("password", "").strip()

    if not name or not registration or not email or not password or not course_id or not ppc_id:
        flash("Todos os campos são obrigatórios.", "error")
        return redirect(url_for("main.index"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Verifica se a matrícula já existe
                cur.execute(
                    "SELECT id FROM users WHERE matricula = %s",
                    (registration,)
                )
                if cur.fetchone():
                    flash("Matrícula já registrada.", "error")
                    return redirect(url_for("main.index"))

                # Verifica se o e-mail já existe
                cur.execute(
                    "SELECT id FROM users WHERE email = %s",
                    (email,)
                )
                if cur.fetchone():
                    flash("E-mail já registrado.", "error")
                    return redirect(url_for("main.index"))

                # Gera o hash da senha
                password_hash = generate_password_hash(password)

                # Insere o novo usuário
                cur.execute(
                    """
                    INSERT INTO users (name, matricula, email, password_hash, curso_id, ppc_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (name, registration, email, password_hash, course_id, ppc_id)
                )

            conn.commit()

        flash("Conta criada com sucesso! Faça login.", "success")
        return redirect(url_for("main.index"))

    except UniqueViolation:
        flash("Matrícula ou e-mail já cadastrados.", "error")
        return redirect(url_for("main.index"))

    except Exception as e:
        print(f"Erro ao registrar: {e}")
        flash("Erro ao registrar.", "error")
        return redirect(url_for("main.index"))


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Realiza o login do usuário e salva os dados principais na sessão,
    incluindo a permissão de administrador.
    """
    registration = request.form.get("registration", "").strip()
    password = request.form.get("password", "").strip()

    if not registration or not password:
        flash("Informe matrícula e senha.", "error")
        return redirect(url_for("main.index"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, name, matricula, email, password_hash, is_admin
                    FROM users
                    WHERE matricula = %s
                    """,
                    (registration,)
                )
                user = cur.fetchone()

        if not user or not check_password_hash(user["password_hash"], password):
            flash("Matrícula ou senha inválidos.", "error")
            return redirect(url_for("main.index"))

        # Dados principais da sessão
        session["user_id"] = user["id"]
        session["user_name"] = user["name"]
        session["user_registration"] = user["matricula"]
        session["user_email"] = user["email"]
        session["is_admin"] = user["is_admin"]

        return redirect(url_for("main.index"))

    except Exception as e:
        print(f"Erro no login: {e}")
        flash("Erro ao fazer login.", "error")
        return redirect(url_for("main.index"))


@auth_bp.route("/logout")
def logout():
    """
    Encerra a sessão do usuário.
    """
    session.clear()
    flash("Você saiu da sessão.", "success")
    return redirect(url_for("main.index"))