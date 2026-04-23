from functools import wraps
import re

from flask import Blueprint, render_template, session, redirect, url_for, flash, request, jsonify
from werkzeug.security import generate_password_hash

from db import get_connection

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# =========================================================
# CONTROLE DE ACESSO
# =========================================================
def admin_required(view_func):
    @wraps(view_func)
    def wrapped_view(*args, **kwargs):
        if "user_id" not in session:
            flash("Faça login para acessar esta página.", "error")
            return redirect(url_for("main.index"))

        if not session.get("is_admin", False):
            flash("Você não tem permissão para acessar esta área.", "error")
            return redirect(url_for("main.index"))

        return view_func(*args, **kwargs)

    return wrapped_view


# =========================================================
# HELPERS GERAIS
# =========================================================
def calcular_creditos(carga_teorica: int, carga_pratica: int) -> int:
    return int(carga_teorica + (carga_pratica / 2))


def obter_ppcs_com_label():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    p.id,
                    p.codigo,
                    c.nome AS curso_nome,
                    CONCAT(c.nome, ' - PPC ', p.codigo) AS label
                FROM ppcs p
                JOIN cursos c ON c.id = p.curso_id
                ORDER BY
                    CASE
                        WHEN c.nome = 'Engenharia de Produção' AND p.codigo = '2023.2' THEN 0
                        ELSE 1
                    END,
                    c.nome,
                    p.codigo
            """)
            return cur.fetchall()


def obter_ppc_padrao(ppcs):
    for ppc in ppcs:
        if ppc["curso_nome"] == "Engenharia de Produção" and str(ppc["codigo"]) == "2023.2":
            return ppc["id"]
    return ppcs[0]["id"] if ppcs else None


def ppc_pertence_ao_curso(cur, curso_id, ppc_id):
    cur.execute("""
        SELECT 1
        FROM ppcs
        WHERE id = %s
          AND curso_id = %s
    """, (ppc_id, curso_id))
    return cur.fetchone() is not None


# =========================================================
# HELPERS DISCIPLINAS
# =========================================================
def validar_campos_disciplina(nome, semestre, carga_teorica, carga_pratica, tipo, ppc_id):
    if not all([nome, carga_teorica, carga_pratica, tipo, ppc_id]):
        return False, "Preencha todos os campos da disciplina.", None

    try:
        carga_teorica_int = int(carga_teorica)
        carga_pratica_int = int(carga_pratica)
        ppc_id_int = int(ppc_id)
    except ValueError:
        return False, "Os campos numéricos da disciplina devem conter apenas números inteiros.", None

    tipos_validos = {"regular", "optativa", "extra"}
    if tipo not in tipos_validos:
        return False, "Tipo de disciplina inválido.", None

    if tipo == "optativa":
        semestre_int = 0
    elif tipo == "extra":
        semestre_int = 11
    else:
        if not semestre:
            return False, "Informe o semestre da disciplina.", None
        try:
            semestre_int = int(semestre)
        except ValueError:
            return False, "O semestre deve ser um número inteiro.", None

        if semestre_int < 1:
            return False, "O semestre deve ser maior ou igual a 1 para disciplinas regulares.", None

    if carga_teorica_int < 0 or carga_pratica_int < 0:
        return False, "As cargas horárias não podem ser negativas.", None

    if carga_pratica_int % 2 != 0:
        return False, "A carga prática deve ser um número par para que os créditos sejam inteiros.", None

    dados = {
        "nome": nome,
        "semestre": semestre_int,
        "carga_teorica": carga_teorica_int,
        "carga_pratica": carga_pratica_int,
        "tipo": tipo,
        "ppc_id": ppc_id_int,
        "creditos": calcular_creditos(carga_teorica_int, carga_pratica_int)
    }

    return True, None, dados


# =========================================================
# HELPERS USUÁRIOS
# =========================================================
def validar_email(email: str) -> bool:
    padrao = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
    return bool(re.fullmatch(padrao, email.strip()))


def validar_matricula(matricula: str) -> bool:
    return bool(re.fullmatch(r"\d{7}", matricula.strip()))


# =========================================================
# DASHBOARD
# =========================================================
@admin_bp.route("/")
@admin_required
def dashboard():
    return render_template(
        "admin_dashboard.html",
        user_name=session.get("user_name", "Administrador")
    )


# =========================================================
# CURSOS
# =========================================================
@admin_bp.route("/cursos")
@admin_required
def cursos():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, nome
                FROM cursos
                ORDER BY id
            """)
            cursos = cur.fetchall()

    return render_template(
        "admin_cursos.html",
        cursos=cursos,
        user_name=session.get("user_name", "Administrador")
    )


@admin_bp.route("/cursos/adicionar", methods=["POST"])
@admin_required
def adicionar_curso():
    nome = request.form.get("nome", "").strip()

    if not nome:
        flash("Informe o nome do curso.", "error")
        return redirect(url_for("admin.cursos"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO cursos (nome)
                    VALUES (%s)
                """, (nome,))
            conn.commit()

        flash("Curso adicionado com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao adicionar curso: {e}")
        flash("Não foi possível adicionar o curso.", "error")

    return redirect(url_for("admin.cursos"))


@admin_bp.route("/cursos/editar/<int:curso_id>", methods=["POST"])
@admin_required
def editar_curso(curso_id):
    nome = request.form.get("nome", "").strip()

    if not nome:
        flash("Informe o nome do curso.", "error")
        return redirect(url_for("admin.cursos"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE cursos
                    SET nome = %s
                    WHERE id = %s
                """, (nome, curso_id))
            conn.commit()

        flash("Curso atualizado com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao editar curso: {e}")
        flash("Não foi possível atualizar o curso.", "error")

    return redirect(url_for("admin.cursos"))


@admin_bp.route("/cursos/excluir/<int:curso_id>", methods=["POST"])
@admin_required
def excluir_curso(curso_id):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM cursos
                    WHERE id = %s
                """, (curso_id,))
            conn.commit()

        flash("Curso excluído com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao excluir curso: {e}")
        flash("Não foi possível excluir o curso. Verifique se ele possui vínculos com PPCs.", "error")

    return redirect(url_for("admin.cursos"))


# =========================================================
# PPCS
# =========================================================
@admin_bp.route("/ppcs")
@admin_required
def ppcs():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    p.id,
                    p.codigo,
                    p.curso_id,
                    c.nome AS curso_nome
                FROM ppcs p
                JOIN cursos c ON c.id = p.curso_id
                ORDER BY p.id
            """)
            ppcs = cur.fetchall()

            cur.execute("""
                SELECT id, nome
                FROM cursos
                ORDER BY nome
            """)
            cursos = cur.fetchall()

    return render_template(
        "admin_ppcs.html",
        ppcs=ppcs,
        cursos=cursos,
        user_name=session.get("user_name", "Administrador")
    )


@admin_bp.route("/ppcs/adicionar", methods=["POST"])
@admin_required
def adicionar_ppc():
    curso_id = request.form.get("curso_id")
    codigo = request.form.get("codigo", "").strip()

    if not curso_id or not codigo:
        flash("Informe o curso e o código do PPC.", "error")
        return redirect(url_for("admin.ppcs"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO ppcs (curso_id, codigo)
                    VALUES (%s, %s)
                """, (curso_id, codigo))
            conn.commit()

        flash("PPC adicionado com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao adicionar PPC: {e}")
        flash("Não foi possível adicionar o PPC. Verifique se ele já existe para este curso.", "error")

    return redirect(url_for("admin.ppcs"))


@admin_bp.route("/ppcs/editar/<int:ppc_id>", methods=["POST"])
@admin_required
def editar_ppc(ppc_id):
    curso_id = request.form.get("curso_id")
    codigo = request.form.get("codigo", "").strip()

    if not curso_id or not codigo:
        flash("Informe o curso e o código do PPC.", "error")
        return redirect(url_for("admin.ppcs"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE ppcs
                    SET curso_id = %s,
                        codigo = %s
                    WHERE id = %s
                """, (curso_id, codigo, ppc_id))
            conn.commit()

        flash("PPC atualizado com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao editar PPC: {e}")
        flash("Não foi possível atualizar o PPC.", "error")

    return redirect(url_for("admin.ppcs"))


@admin_bp.route("/ppcs/excluir/<int:ppc_id>", methods=["POST"])
@admin_required
def excluir_ppc(ppc_id):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM ppcs
                    WHERE id = %s
                """, (ppc_id,))
            conn.commit()

        flash("PPC excluído com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao excluir PPC: {e}")
        flash("Não foi possível excluir o PPC. Verifique se ele possui vínculos com usuários ou disciplinas.", "error")

    return redirect(url_for("admin.ppcs"))


# =========================================================
# DISCIPLINAS
# =========================================================
@admin_bp.route("/disciplinas")
@admin_required
def disciplinas():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    d.id,
                    d.nome,
                    d.semestre,
                    d.creditos,
                    d.carga_teorica,
                    d.carga_pratica,
                    d.tipo,
                    d.ppc_id,
                    p.codigo AS ppc_codigo,
                    c.nome AS curso_nome,
                    CONCAT(c.nome, ' - PPC ', p.codigo) AS ppc_label,
                    COUNT(DISTINCT ed.disciplina_equivalente_id) AS total_equivalencias,
                    COALESCE(
                        STRING_AGG(
                            DISTINCT deq.nome || ' • ' || c2.nome || ' • PPC ' || p2.codigo,
                            ' || '
                        ) FILTER (WHERE deq.id IS NOT NULL),
                        ''
                    ) AS equivalencias_tooltip,
                    COUNT(DISTINCT pr.disciplina_pre_req_id) FILTER (WHERE pr.disciplina_pre_req_id IS NOT NULL) AS total_pre_requisitos,
                    COALESCE(
                        STRING_AGG(
                            DISTINCT dpr.nome || ' • ' || c3.nome || ' • PPC ' || p3.codigo,
                            ' || '
                        ) FILTER (WHERE dpr.id IS NOT NULL),
                        ''
                    ) AS pre_requisitos_tooltip,
                    MAX(pr.creditos_minimos) AS creditos_minimos
                FROM disciplinas d
                JOIN ppcs p ON p.id = d.ppc_id
                JOIN cursos c ON c.id = p.curso_id
                LEFT JOIN equivalencias_disciplina ed ON ed.disciplina_id = d.id
                LEFT JOIN disciplinas deq ON deq.id = ed.disciplina_equivalente_id
                LEFT JOIN ppcs p2 ON p2.id = deq.ppc_id
                LEFT JOIN cursos c2 ON c2.id = p2.curso_id
                LEFT JOIN pre_requisitos pr ON pr.disciplina_id = d.id
                LEFT JOIN disciplinas dpr ON dpr.id = pr.disciplina_pre_req_id
                LEFT JOIN ppcs p3 ON p3.id = dpr.ppc_id
                LEFT JOIN cursos c3 ON c3.id = p3.curso_id
                GROUP BY
                    d.id, d.nome, d.semestre, d.creditos, d.carga_teorica,
                    d.carga_pratica, d.tipo, d.ppc_id,
                    p.codigo, c.nome
                ORDER BY d.id
            """)
            disciplinas = cur.fetchall()

            cur.execute("""
                SELECT
                    p.id,
                    p.codigo,
                    c.nome AS curso_nome,
                    CONCAT(c.nome, ' - PPC ', p.codigo) AS label
                FROM ppcs p
                JOIN cursos c ON c.id = p.curso_id
                ORDER BY c.nome, p.codigo
            """)
            ppcs = cur.fetchall()

    return render_template(
        "admin_disciplinas.html",
        disciplinas=disciplinas,
        ppcs=ppcs,
        user_name=session.get("user_name", "Administrador")
    )


@admin_bp.route("/disciplinas/adicionar", methods=["POST"])
@admin_required
def adicionar_disciplina():
    nome = request.form.get("nome", "").strip()
    semestre = request.form.get("semestre", "").strip()
    carga_teorica = request.form.get("carga_teorica", "").strip()
    carga_pratica = request.form.get("carga_pratica", "").strip()
    tipo = request.form.get("tipo", "").strip()
    ppc_id = request.form.get("ppc_id")

    eh_valido, mensagem_erro, dados = validar_campos_disciplina(
        nome=nome,
        semestre=semestre,
        carga_teorica=carga_teorica,
        carga_pratica=carga_pratica,
        tipo=tipo,
        ppc_id=ppc_id
    )

    if not eh_valido:
        flash(mensagem_erro, "error")
        return redirect(url_for("admin.disciplinas"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO disciplinas (
                        nome,
                        semestre,
                        creditos,
                        carga_teorica,
                        carga_pratica,
                        tipo,
                        ppc_id
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    dados["nome"],
                    dados["semestre"],
                    dados["creditos"],
                    dados["carga_teorica"],
                    dados["carga_pratica"],
                    dados["tipo"],
                    dados["ppc_id"]
                ))
            conn.commit()

        flash("Disciplina adicionada com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao adicionar disciplina: {e}")
        flash("Não foi possível adicionar a disciplina.", "error")

    return redirect(url_for("admin.disciplinas"))


@admin_bp.route("/disciplinas/editar/<int:disciplina_id>", methods=["POST"])
@admin_required
def editar_disciplina(disciplina_id):
    nome = request.form.get("nome", "").strip()
    semestre = request.form.get("semestre", "").strip()
    carga_teorica = request.form.get("carga_teorica", "").strip()
    carga_pratica = request.form.get("carga_pratica", "").strip()
    tipo = request.form.get("tipo", "").strip()
    ppc_id = request.form.get("ppc_id")

    eh_valido, mensagem_erro, dados = validar_campos_disciplina(
        nome=nome,
        semestre=semestre,
        carga_teorica=carga_teorica,
        carga_pratica=carga_pratica,
        tipo=tipo,
        ppc_id=ppc_id
    )

    if not eh_valido:
        flash(mensagem_erro, "error")
        return redirect(url_for("admin.disciplinas"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE disciplinas
                    SET
                        nome = %s,
                        semestre = %s,
                        creditos = %s,
                        carga_teorica = %s,
                        carga_pratica = %s,
                        tipo = %s,
                        ppc_id = %s
                    WHERE id = %s
                """, (
                    dados["nome"],
                    dados["semestre"],
                    dados["creditos"],
                    dados["carga_teorica"],
                    dados["carga_pratica"],
                    dados["tipo"],
                    dados["ppc_id"],
                    disciplina_id
                ))
            conn.commit()

        flash("Disciplina atualizada com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao editar disciplina: {e}")
        flash("Não foi possível atualizar a disciplina.", "error")

    return redirect(url_for("admin.disciplinas"))


@admin_bp.route("/disciplinas/excluir/<int:disciplina_id>", methods=["POST"])
@admin_required
def excluir_disciplina(disciplina_id):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM disciplinas
                    WHERE id = %s
                """, (disciplina_id,))
            conn.commit()

        flash("Disciplina excluída com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao excluir disciplina: {e}")
        flash("Não foi possível excluir a disciplina. Verifique se ela possui vínculos com outras tabelas.", "error")

    return redirect(url_for("admin.disciplinas"))


# =========================================================
# EQUIVALÊNCIAS
# =========================================================
@admin_bp.route("/disciplinas/<int:disciplina_id>/equivalencias/json")
@admin_required
def listar_equivalencias_disciplina_json(disciplina_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    d.id,
                    d.nome,
                    d.ppc_id,
                    c.nome AS curso_nome,
                    p.codigo AS ppc_codigo
                FROM disciplinas d
                JOIN ppcs p ON p.id = d.ppc_id
                JOIN cursos c ON c.id = p.curso_id
                WHERE d.id = %s
                LIMIT 1
            """, (disciplina_id,))
            disciplina_base = cur.fetchone()

            if not disciplina_base:
                return jsonify({"error": "Disciplina não encontrada."}), 404

            cur.execute("""
                SELECT
                    ed.id,
                    d.id AS disciplina_id,
                    d.nome,
                    c.nome AS curso_nome,
                    p.codigo AS ppc_codigo
                FROM equivalencias_disciplina ed
                JOIN disciplinas d ON d.id = ed.disciplina_equivalente_id
                JOIN ppcs p ON p.id = d.ppc_id
                JOIN cursos c ON c.id = p.curso_id
                WHERE ed.disciplina_id = %s
                ORDER BY d.nome
            """, (disciplina_id,))
            equivalencias = cur.fetchall()

            equivalentes_ids = {str(eq["disciplina_id"]) for eq in equivalencias}

            cur.execute("""
                SELECT
                    d.id,
                    d.nome,
                    c.nome AS curso_nome,
                    p.codigo AS ppc_codigo
                FROM disciplinas d
                JOIN ppcs p ON p.id = d.ppc_id
                JOIN cursos c ON c.id = p.curso_id
                WHERE d.id <> %s
                  AND d.ppc_id = %s
                  AND LOWER(d.tipo) = 'extra'
                ORDER BY d.nome
            """, (disciplina_id, disciplina_base["ppc_id"]))
            todas = cur.fetchall()

            disponiveis = [
                d for d in todas
                if str(d["id"]) not in equivalentes_ids
            ]

    return jsonify({
        "disciplina": {
            "id": disciplina_base["id"],
            "nome": disciplina_base["nome"],
            "curso_nome": disciplina_base["curso_nome"],
            "ppc_codigo": disciplina_base["ppc_codigo"]
        },
        "equivalencias": [
            {
                "id": eq["id"],
                "disciplina_id": eq["disciplina_id"],
                "nome": eq["nome"],
                "curso_nome": eq["curso_nome"],
                "ppc_codigo": eq["ppc_codigo"]
            }
            for eq in equivalencias
        ],
        "disponiveis": [
            {
                "id": d["id"],
                "nome": d["nome"],
                "curso_nome": d["curso_nome"],
                "ppc_codigo": d["ppc_codigo"]
            }
            for d in disponiveis
        ]
    })


@admin_bp.route("/disciplinas/<int:disciplina_id>/equivalencias/adicionar", methods=["POST"])
@admin_required
def adicionar_equivalencia_disciplina(disciplina_id):
    disciplina_equivalente_id = request.form.get("disciplina_equivalente_id", "").strip()

    if not disciplina_equivalente_id:
        flash("Selecione uma disciplina equivalente.", "error")
        return redirect(url_for("admin.disciplinas"))

    try:
        disciplina_equivalente_id = int(disciplina_equivalente_id)

        if disciplina_id == disciplina_equivalente_id:
            flash("Uma disciplina não pode ser equivalente a ela mesma.", "error")
            return redirect(url_for("admin.disciplinas"))

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, ppc_id, LOWER(tipo) AS tipo
                    FROM disciplinas
                    WHERE id = %s
                    LIMIT 1
                """, (disciplina_id,))
                base = cur.fetchone()

                cur.execute("""
                    SELECT id, ppc_id, LOWER(tipo) AS tipo
                    FROM disciplinas
                    WHERE id = %s
                    LIMIT 1
                """, (disciplina_equivalente_id,))
                equivalente = cur.fetchone()

                if not base or not equivalente:
                    flash("Disciplina inválida para equivalência.", "error")
                    return redirect(url_for("admin.disciplinas"))

                if int(base["ppc_id"]) != int(equivalente["ppc_id"]):
                    flash("A equivalência só pode ser feita entre disciplinas do mesmo PPC.", "error")
                    return redirect(url_for("admin.disciplinas"))

                if equivalente["tipo"] != "extra":
                    flash("A disciplina equivalente deve ser do tipo extra.", "error")
                    return redirect(url_for("admin.disciplinas"))

                cur.execute("""
                    SELECT 1
                    FROM equivalencias_disciplina
                    WHERE disciplina_id = %s
                      AND disciplina_equivalente_id = %s
                """, (disciplina_id, disciplina_equivalente_id))
                ja_existe = cur.fetchone()

                if not ja_existe:
                    cur.execute("""
                        INSERT INTO equivalencias_disciplina (
                            disciplina_id,
                            disciplina_equivalente_id
                        )
                        VALUES (%s, %s)
                    """, (disciplina_id, disciplina_equivalente_id))

                cur.execute("""
                    SELECT 1
                    FROM equivalencias_disciplina
                    WHERE disciplina_id = %s
                      AND disciplina_equivalente_id = %s
                """, (disciplina_equivalente_id, disciplina_id))
                volta_existe = cur.fetchone()

                if not volta_existe:
                    cur.execute("""
                        INSERT INTO equivalencias_disciplina (
                            disciplina_id,
                            disciplina_equivalente_id
                        )
                        VALUES (%s, %s)
                    """, (disciplina_equivalente_id, disciplina_id))

            conn.commit()

        flash("Equivalência adicionada com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao adicionar equivalência: {e}")
        flash("Não foi possível adicionar a equivalência.", "error")

    return redirect(url_for("admin.disciplinas"))


@admin_bp.route("/disciplinas/<int:disciplina_id>/equivalencias/<int:disciplina_equivalente_id>/excluir", methods=["POST"])
@admin_required
def excluir_equivalencia_disciplina(disciplina_id, disciplina_equivalente_id):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM equivalencias_disciplina
                    WHERE (disciplina_id = %s AND disciplina_equivalente_id = %s)
                       OR (disciplina_id = %s AND disciplina_equivalente_id = %s)
                """, (
                    disciplina_id, disciplina_equivalente_id,
                    disciplina_equivalente_id, disciplina_id
                ))
            conn.commit()

        flash("Equivalência removida com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao excluir equivalência: {e}")
        flash("Não foi possível remover a equivalência.", "error")

    return redirect(url_for("admin.disciplinas"))


# =========================================================
# PRÉ-REQUISITOS
# =========================================================
@admin_bp.route("/disciplinas/<int:disciplina_id>/pre-requisitos/json")
@admin_required
def listar_pre_requisitos_disciplina_json(disciplina_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    d.id,
                    d.nome,
                    d.ppc_id,
                    c.nome AS curso_nome,
                    p.codigo AS ppc_codigo
                FROM disciplinas d
                JOIN ppcs p ON p.id = d.ppc_id
                JOIN cursos c ON c.id = p.curso_id
                WHERE d.id = %s
                LIMIT 1
            """, (disciplina_id,))
            disciplina_base = cur.fetchone()

            if not disciplina_base:
                return jsonify({"error": "Disciplina não encontrada."}), 404

            cur.execute("""
                SELECT
                    pr.id,
                    pr.disciplina_pre_req_id,
                    pr.creditos_minimos,
                    d.nome,
                    c.nome AS curso_nome,
                    p.codigo AS ppc_codigo
                FROM pre_requisitos pr
                LEFT JOIN disciplinas d ON d.id = pr.disciplina_pre_req_id
                LEFT JOIN ppcs p ON p.id = d.ppc_id
                LEFT JOIN cursos c ON c.id = p.curso_id
                WHERE pr.disciplina_id = %s
                ORDER BY d.nome NULLS LAST, pr.id
            """, (disciplina_id,))
            pre_requisitos = cur.fetchall()

            prereq_ids = {
                str(pr["disciplina_pre_req_id"])
                for pr in pre_requisitos
                if pr["disciplina_pre_req_id"] is not None
            }

            cur.execute("""
                SELECT
                    d.id,
                    d.nome,
                    c.nome AS curso_nome,
                    p.codigo AS ppc_codigo
                FROM disciplinas d
                JOIN ppcs p ON p.id = d.ppc_id
                JOIN cursos c ON c.id = p.curso_id
                WHERE d.id <> %s
                  AND d.ppc_id = %s
                ORDER BY d.nome
            """, (disciplina_id, disciplina_base["ppc_id"]))
            todas = cur.fetchall()

            disponiveis = [
                d for d in todas
                if str(d["id"]) not in prereq_ids
            ]

            cur.execute("""
                SELECT MAX(creditos_minimos) AS creditos_minimos
                FROM pre_requisitos
                WHERE disciplina_id = %s
            """, (disciplina_id,))
            creditos = cur.fetchone()

    return jsonify({
        "disciplina": {
            "id": disciplina_base["id"],
            "nome": disciplina_base["nome"],
            "curso_nome": disciplina_base["curso_nome"],
            "ppc_codigo": disciplina_base["ppc_codigo"]
        },
        "pre_requisitos": [
            {
                "id": pr["id"],
                "disciplina_pre_req_id": pr["disciplina_pre_req_id"],
                "creditos_minimos": pr["creditos_minimos"],
                "nome": pr["nome"],
                "curso_nome": pr["curso_nome"],
                "ppc_codigo": pr["ppc_codigo"]
            }
            for pr in pre_requisitos
            if pr["disciplina_pre_req_id"] is not None
        ],
        "disponiveis": [
            {
                "id": d["id"],
                "nome": d["nome"],
                "curso_nome": d["curso_nome"],
                "ppc_codigo": d["ppc_codigo"]
            }
            for d in disponiveis
        ],
        "creditos_minimos": creditos["creditos_minimos"] if creditos else None
    })


@admin_bp.route("/disciplinas/<int:disciplina_id>/pre-requisitos/adicionar", methods=["POST"])
@admin_required
def adicionar_pre_requisito_disciplina(disciplina_id):
    disciplina_pre_req_id = request.form.get("disciplina_pre_req_id", "").strip()

    if not disciplina_pre_req_id:
        flash("Selecione uma disciplina pré-requisito.", "error")
        return redirect(url_for("admin.disciplinas"))

    try:
        disciplina_pre_req_id = int(disciplina_pre_req_id)

        if disciplina_id == disciplina_pre_req_id:
            flash("Uma disciplina não pode ser pré-requisito dela mesma.", "error")
            return redirect(url_for("admin.disciplinas"))

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT ppc_id
                    FROM disciplinas
                    WHERE id = %s
                """, (disciplina_id,))
                base = cur.fetchone()

                cur.execute("""
                    SELECT ppc_id
                    FROM disciplinas
                    WHERE id = %s
                """, (disciplina_pre_req_id,))
                prereq = cur.fetchone()

                if not base or not prereq:
                    flash("Disciplina inválida para pré-requisito.", "error")
                    return redirect(url_for("admin.disciplinas"))

                if int(base["ppc_id"]) != int(prereq["ppc_id"]):
                    flash("O pré-requisito deve ser do mesmo PPC.", "error")
                    return redirect(url_for("admin.disciplinas"))

                cur.execute("""
                    SELECT 1
                    FROM pre_requisitos
                    WHERE disciplina_id = %s
                      AND disciplina_pre_req_id = %s
                """, (disciplina_id, disciplina_pre_req_id))
                existe = cur.fetchone()

                if existe:
                    flash("Esse pré-requisito já está cadastrado.", "error")
                    return redirect(url_for("admin.disciplinas"))

                cur.execute("""
                    INSERT INTO pre_requisitos (
                        disciplina_id,
                        disciplina_pre_req_id,
                        creditos_minimos
                    )
                    VALUES (%s, %s, NULL)
                """, (disciplina_id, disciplina_pre_req_id))

            conn.commit()

        flash("Pré-requisito adicionado com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao adicionar pré-requisito: {e}")
        flash("Não foi possível adicionar o pré-requisito.", "error")

    return redirect(url_for("admin.disciplinas"))


@admin_bp.route("/disciplinas/pre-requisitos/<int:pre_req_id>/excluir", methods=["POST"])
@admin_required
def excluir_pre_requisito_disciplina(pre_req_id):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM pre_requisitos
                    WHERE id = %s
                """, (pre_req_id,))
            conn.commit()

        flash("Pré-requisito removido com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao excluir pré-requisito: {e}")
        flash("Não foi possível remover o pré-requisito.", "error")

    return redirect(url_for("admin.disciplinas"))


@admin_bp.route("/disciplinas/<int:disciplina_id>/pre-requisitos/creditos", methods=["POST"])
@admin_required
def salvar_creditos_minimos_disciplina(disciplina_id):
    creditos_minimos = request.form.get("creditos_minimos", "").strip()

    try:
        valor = None if creditos_minimos == "" else int(creditos_minimos)

        if valor is not None and valor < 0:
            flash("Os créditos mínimos não podem ser negativos.", "error")
            return redirect(url_for("admin.disciplinas"))

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM pre_requisitos
                    WHERE disciplina_id = %s
                      AND disciplina_pre_req_id IS NULL
                """, (disciplina_id,))

                if valor is not None:
                    cur.execute("""
                        INSERT INTO pre_requisitos (
                            disciplina_id,
                            disciplina_pre_req_id,
                            creditos_minimos
                        )
                        VALUES (%s, NULL, %s)
                    """, (disciplina_id, valor))

            conn.commit()

        flash("Créditos mínimos atualizados com sucesso.", "success")

    except ValueError:
        flash("Informe um número inteiro para créditos mínimos.", "error")
    except Exception as e:
        print(f"Erro ao salvar créditos mínimos: {e}")
        flash("Não foi possível atualizar os créditos mínimos.", "error")

    return redirect(url_for("admin.disciplinas"))


# =========================================================
# USUÁRIOS
# =========================================================
@admin_bp.route("/usuarios")
@admin_required
def usuarios():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    u.id,
                    u.name AS nome,
                    u.email,
                    u.matricula,
                    u.curso_id,
                    u.ppc_id,
                    COALESCE(u.is_admin, FALSE) AS is_admin,
                    c.nome AS curso_nome,
                    p.codigo AS ppc_codigo
                FROM users u
                LEFT JOIN cursos c ON c.id = u.curso_id
                LEFT JOIN ppcs p ON p.id = u.ppc_id
                ORDER BY u.id
            """)
            usuarios = cur.fetchall()

            cur.execute("""
                SELECT id, nome
                FROM cursos
                ORDER BY nome
            """)
            cursos = cur.fetchall()

            cur.execute("""
                SELECT
                    p.id,
                    p.codigo,
                    p.curso_id
                FROM ppcs p
                ORDER BY p.curso_id, p.codigo
            """)
            ppcs = cur.fetchall()

    return render_template(
        "admin_usuarios.html",
        usuarios=usuarios,
        cursos=cursos,
        ppcs=ppcs
    )


@admin_bp.route("/usuarios/adicionar", methods=["POST"])
@admin_required
def adicionar_usuario():
    nome = request.form.get("nome", "").strip()
    email = request.form.get("email", "").strip()
    matricula = request.form.get("matricula", "").strip()
    senha = request.form.get("senha", "").strip()
    curso_id = request.form.get("curso_id", "").strip()
    ppc_id = request.form.get("ppc_id", "").strip()
    is_admin = request.form.get("is_admin") == "on"

    if not all([nome, email, matricula, senha, curso_id, ppc_id]):
        flash("Preencha todos os campos do usuário.", "error")
        return redirect(url_for("admin.usuarios"))

    if not validar_email(email):
        flash("Informe um e-mail válido.", "error")
        return redirect(url_for("admin.usuarios"))

    if not validar_matricula(matricula):
        flash("A matrícula deve conter exatamente 7 números.", "error")
        return redirect(url_for("admin.usuarios"))

    try:
        curso_id_int = int(curso_id)
        ppc_id_int = int(ppc_id)
    except ValueError:
        flash("Curso e PPC inválidos.", "error")
        return redirect(url_for("admin.usuarios"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                if not ppc_pertence_ao_curso(cur, curso_id_int, ppc_id_int):
                    flash("O PPC selecionado não pertence ao curso informado.", "error")
                    return redirect(url_for("admin.usuarios"))

                cur.execute("""
                    INSERT INTO users (
                        name,
                        email,
                        matricula,
                        password_hash,
                        curso_id,
                        ppc_id,
                        is_admin
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    nome,
                    email,
                    matricula,
                    generate_password_hash(senha),
                    curso_id_int,
                    ppc_id_int,
                    is_admin
                ))
            conn.commit()

        flash("Usuário adicionado com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao adicionar usuário: {e}")
        flash("Não foi possível adicionar o usuário. Verifique e-mail, matrícula e dados informados.", "error")

    return redirect(url_for("admin.usuarios"))


@admin_bp.route("/usuarios/editar/<int:user_id>", methods=["POST"])
@admin_required
def editar_usuario(user_id):
    nome = request.form.get("nome", "").strip()
    email = request.form.get("email", "").strip()
    matricula = request.form.get("matricula", "").strip()
    senha = request.form.get("senha", "").strip()
    curso_id = request.form.get("curso_id", "").strip()
    ppc_id = request.form.get("ppc_id", "").strip()
    is_admin = request.form.get("is_admin") == "on"

    if not all([nome, email, matricula, curso_id, ppc_id]):
        flash("Preencha todos os campos obrigatórios.", "error")
        return redirect(url_for("admin.usuarios"))

    if not validar_email(email):
        flash("Informe um e-mail válido.", "error")
        return redirect(url_for("admin.usuarios"))

    if not validar_matricula(matricula):
        flash("A matrícula deve conter exatamente 7 números.", "error")
        return redirect(url_for("admin.usuarios"))

    try:
        curso_id_int = int(curso_id)
        ppc_id_int = int(ppc_id)
    except ValueError:
        flash("Curso e PPC inválidos.", "error")
        return redirect(url_for("admin.usuarios"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                if not ppc_pertence_ao_curso(cur, curso_id_int, ppc_id_int):
                    flash("O PPC selecionado não pertence ao curso informado.", "error")
                    return redirect(url_for("admin.usuarios"))

                if senha:
                    cur.execute("""
                        UPDATE users
                        SET
                            name = %s,
                            email = %s,
                            matricula = %s,
                            password_hash = %s,
                            curso_id = %s,
                            ppc_id = %s,
                            is_admin = %s
                        WHERE id = %s
                    """, (
                        nome,
                        email,
                        matricula,
                        generate_password_hash(senha),
                        curso_id_int,
                        ppc_id_int,
                        is_admin,
                        user_id
                    ))
                else:
                    cur.execute("""
                        UPDATE users
                        SET
                            name = %s,
                            email = %s,
                            matricula = %s,
                            curso_id = %s,
                            ppc_id = %s,
                            is_admin = %s
                        WHERE id = %s
                    """, (
                        nome,
                        email,
                        matricula,
                        curso_id_int,
                        ppc_id_int,
                        is_admin,
                        user_id
                    ))
            conn.commit()

        flash("Usuário atualizado com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao editar usuário: {e}")
        flash("Não foi possível atualizar o usuário.", "error")

    return redirect(url_for("admin.usuarios"))


@admin_bp.route("/usuarios/excluir/<int:user_id>", methods=["POST"])
@admin_required
def excluir_usuario(user_id):
    if session.get("user_id") == user_id:
        flash("Você não pode excluir o próprio usuário logado.", "error")
        return redirect(url_for("admin.usuarios"))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM users
                    WHERE id = %s
                """, (user_id,))
            conn.commit()

        flash("Usuário excluído com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao excluir usuário: {e}")
        flash("Não foi possível excluir o usuário.", "error")

    return redirect(url_for("admin.usuarios"))


# =========================================================
# HORÁRIOS
# =========================================================
@admin_bp.route("/horarios")
@admin_required
def horarios():
    ppcs = obter_ppcs_com_label()
    ppc_padrao_id = obter_ppc_padrao(ppcs)

    ppc_id_param = request.args.get("ppc_id", "").strip()
    selected_ppc_id = int(ppc_id_param) if ppc_id_param.isdigit() else ppc_padrao_id

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    id,
                    nome
                FROM dias_semana
                ORDER BY id
            """)
            dias_semana = cur.fetchall()

            cur.execute("""
                SELECT
                    id,
                    ordem,
                    hora_inicio,
                    hora_fim
                FROM blocos_horario
                WHERE tipo_grade = 'semana'
                ORDER BY ordem
            """)
            blocos = cur.fetchall()

            cur.execute("""
                SELECT
                    d.id,
                    d.nome,
                    d.semestre,
                    d.tipo,
                    d.ppc_id,
                    p.codigo AS ppc_codigo,
                    c.nome AS curso_nome
                FROM disciplinas d
                JOIN ppcs p ON p.id = d.ppc_id
                JOIN cursos c ON c.id = p.curso_id
                WHERE d.ppc_id = %s
                ORDER BY
                    CASE
                        WHEN LOWER(d.tipo) = 'optativa' THEN 999
                        WHEN LOWER(d.tipo) = 'extra' THEN 1000
                        ELSE d.semestre
                    END,
                    d.nome
            """, (selected_ppc_id,))
            disciplinas = cur.fetchall()

            cur.execute("""
                SELECT
                    hd.id,
                    hd.disciplina_id,
                    hd.dia_semana_id,
                    hd.bloco_inicio,
                    hd.quantidade_blocos,
                    d.nome AS disciplina_nome,
                    d.semestre,
                    d.tipo,
                    d.ppc_id,
                    ds.nome AS dia_nome,
                    bh.ordem AS bloco_ordem,
                    bh.hora_inicio,
                    bh.hora_fim
                FROM horarios_disciplina hd
                JOIN disciplinas d ON d.id = hd.disciplina_id
                JOIN dias_semana ds ON ds.id = hd.dia_semana_id
                JOIN blocos_horario bh ON bh.id = hd.bloco_inicio
                WHERE d.ppc_id = %s
                ORDER BY d.semestre, d.nome, hd.dia_semana_id, bh.ordem
            """, (selected_ppc_id,))
            horarios_raw = cur.fetchall()

    disciplinas_por_id = {d["id"]: d for d in disciplinas}
    blocos_por_ordem = {b["ordem"]: b for b in blocos}

    secoes = []
    for sem in range(1, 11):
        secoes.append({
            "key": f"sem_{sem}",
            "titulo": f"{sem}º Semestre",
            "tipo": "regular",
            "semestre": sem,
            "grid": {}
        })

    secoes.append({
        "key": "optativas",
        "titulo": "Optativas",
        "tipo": "optativa",
        "semestre": 0,
        "grid": {}
    })

    secoes.append({
        "key": "extras",
        "titulo": "Turmas Extras",
        "tipo": "extra",
        "semestre": 11,
        "grid": {}
    })

    secao_map = {sec["key"]: sec for sec in secoes}

    for sec in secoes:
        for bloco in blocos:
            for dia in dias_semana:
                sec["grid"][(bloco["id"], dia["id"])] = []

    for horario in horarios_raw:
        disciplina = disciplinas_por_id.get(horario["disciplina_id"])
        if not disciplina:
            continue

        tipo = (disciplina["tipo"] or "").lower()
        semestre = disciplina["semestre"]

        if tipo == "optativa":
            sec_key = "optativas"
        elif tipo == "extra":
            sec_key = "extras"
        elif 1 <= semestre <= 10:
            sec_key = f"sem_{semestre}"
        else:
            continue

        sec = secao_map[sec_key]
        bloco_inicial = blocos_por_ordem.get(horario["bloco_ordem"])
        if not bloco_inicial:
            continue

        for offset in range(horario["quantidade_blocos"]):
            ordem_atual = horario["bloco_ordem"] + offset
            bloco_atual = blocos_por_ordem.get(ordem_atual)
            if not bloco_atual:
                continue

            sec["grid"][(bloco_atual["id"], horario["dia_semana_id"])].append({
                "horario_id": horario["id"],
                "disciplina_id": horario["disciplina_id"],
                "disciplina_nome": horario["disciplina_nome"],
                "dia_semana_id": horario["dia_semana_id"],
                "bloco_inicio": horario["bloco_inicio"],
                "quantidade_blocos": horario["quantidade_blocos"],
                "tipo": horario["tipo"],
                "semestre": horario["semestre"],
                "is_start": offset == 0
            })

    return render_template(
        "admin_horarios.html",
        ppcs=ppcs,
        selected_ppc_id=selected_ppc_id,
        dias_semana=dias_semana,
        blocos=blocos,
        disciplinas=disciplinas,
        secoes=secoes,
        user_name=session.get("user_name", "Administrador")
    )


@admin_bp.route("/horarios/adicionar", methods=["POST"])
@admin_required
def adicionar_horario():
    ppc_id = request.form.get("ppc_id", "").strip()
    disciplina_id = request.form.get("disciplina_id", "").strip()
    dia_semana_id = request.form.get("dia_semana_id", "").strip()
    bloco_inicio = request.form.get("bloco_inicio", "").strip()
    quantidade_blocos = request.form.get("quantidade_blocos", "").strip()

    if not all([ppc_id, disciplina_id, dia_semana_id, bloco_inicio, quantidade_blocos]):
        flash("Preencha todos os campos do horário.", "error")
        return redirect(url_for("admin.horarios", ppc_id=ppc_id))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO horarios_disciplina (
                        disciplina_id,
                        dia_semana_id,
                        bloco_inicio,
                        quantidade_blocos
                    )
                    VALUES (%s, %s, %s, %s)
                """, (
                    int(disciplina_id),
                    int(dia_semana_id),
                    int(bloco_inicio),
                    int(quantidade_blocos)
                ))
            conn.commit()

        flash("Horário adicionado com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao adicionar horário: {e}")
        flash("Não foi possível adicionar o horário.", "error")

    return redirect(url_for("admin.horarios", ppc_id=ppc_id))


@admin_bp.route("/horarios/editar/<int:horario_id>", methods=["POST"])
@admin_required
def editar_horario(horario_id):
    ppc_id = request.form.get("ppc_id", "").strip()
    disciplina_id = request.form.get("disciplina_id", "").strip()
    dia_semana_id = request.form.get("dia_semana_id", "").strip()
    bloco_inicio = request.form.get("bloco_inicio", "").strip()
    quantidade_blocos = request.form.get("quantidade_blocos", "").strip()

    if not all([ppc_id, disciplina_id, dia_semana_id, bloco_inicio, quantidade_blocos]):
        flash("Preencha todos os campos do horário.", "error")
        return redirect(url_for("admin.horarios", ppc_id=ppc_id))

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE horarios_disciplina
                    SET
                        disciplina_id = %s,
                        dia_semana_id = %s,
                        bloco_inicio = %s,
                        quantidade_blocos = %s
                    WHERE id = %s
                """, (
                    int(disciplina_id),
                    int(dia_semana_id),
                    int(bloco_inicio),
                    int(quantidade_blocos),
                    horario_id
                ))
            conn.commit()

        flash("Horário atualizado com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao editar horário: {e}")
        flash("Não foi possível atualizar o horário.", "error")

    return redirect(url_for("admin.horarios", ppc_id=ppc_id))


@admin_bp.route("/horarios/excluir/<int:horario_id>", methods=["POST"])
@admin_required
def excluir_horario(horario_id):
    ppc_id = request.form.get("ppc_id", "").strip()

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM horarios_disciplina
                    WHERE id = %s
                """, (horario_id,))
            conn.commit()

        flash("Horário excluído com sucesso.", "success")

    except Exception as e:
        print(f"Erro ao excluir horário: {e}")
        flash("Não foi possível excluir o horário.", "error")

    return redirect(url_for("admin.horarios", ppc_id=ppc_id))