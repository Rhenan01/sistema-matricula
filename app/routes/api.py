from flask import Blueprint, jsonify, session, request
from db import get_connection

# Criação do blueprint responsável pelas rotas de API do sistema
api_bp = Blueprint('api', __name__)


@api_bp.route("/api/ppc")
def api_ppc():
    """
    Retorna todos os dados acadêmicos necessários para montagem da grade do usuário logado,
    com base no PPC associado à conta dele.

    Estrutura retornada:
    - disciplinas
    - horarios
    - pre_requisitos
    - equivalencias
    - nome_para_id
    """

    # Obtém o ID do usuário autenticado armazenado na sessão
    user_id = session.get("user_id")

    # Impede acesso caso o usuário não esteja autenticado
    if not user_id:
        return jsonify({"error": "Usuário não autenticado"}), 401

    # Busca os dados básicos do usuário para descobrir qual PPC está vinculado à conta
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, name, ppc_id
                FROM users
                WHERE id = %s
            """, (user_id,))
            user_row = cur.fetchone()

    # Valida se o usuário da sessão realmente existe no banco
    if not user_row:
        return jsonify({"error": "Usuário da sessão não encontrado"}), 400

    # Garante que o usuário possua um PPC definido
    if not user_row["ppc_id"]:
        return jsonify({"error": "Usuário sem PPC definido"}), 400

    # PPC que será usado como base para buscar as disciplinas e relacionamentos
    ppc_id = user_row["ppc_id"]

    # =========================
    # DISCIPLINAS
    # =========================
    # Busca todas as disciplinas do PPC do usuário
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, nome, semestre, creditos, carga_teorica, carga_pratica, tipo, ppc_id
                FROM disciplinas
                WHERE ppc_id = %s
                ORDER BY id
            """, (ppc_id,))
            rows_disc = cur.fetchall()

    # Organiza as disciplinas em um dicionário indexado pelo ID
    disciplinas = {
        str(row["id"]): {
            "id": str(row["id"]),
            "nome": row["nome"],
            "semestre": row["semestre"],
            "creditos": row["creditos"],
            "carga_teorica": row["carga_teorica"],
            "carga_pratica": row["carga_pratica"],
            "tipo": row["tipo"],
            "ppc_id": row["ppc_id"]
        }
        for row in rows_disc
    }

    # Lista com os IDs das disciplinas do PPC
    disciplina_ids = [row["id"] for row in rows_disc]

    # Caso o PPC não possua disciplinas cadastradas,
    # retorna a estrutura vazia esperada pelo front-end
    if not disciplina_ids:
        return jsonify({
            "disciplinas": {},
            "horarios": {},
            "pre_requisitos": {},
            "equivalencias": {},
            "nome_para_id": {}
        })

    # =========================
    # HORÁRIOS
    # =========================
    # Busca os horários vinculados às disciplinas selecionadas
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    hd.disciplina_id,
                    ds.sigla AS dia,
                    hd.bloco_inicio,
                    hd.quantidade_blocos
                FROM horarios_disciplina hd
                JOIN dias_semana ds
                    ON ds.id = hd.dia_semana_id
                WHERE hd.disciplina_id = ANY(%s)
                ORDER BY ds.ordem, hd.bloco_inicio
            """, (disciplina_ids,))
            rows_horarios = cur.fetchall()

    # Agrupa os horários por disciplina
    # Cada disciplina pode possuir um ou mais blocos em dias diferentes
    horarios = {}
    for row in rows_horarios:
        disc_id = row["disciplina_id"]

        if disc_id not in horarios:
            horarios[disc_id] = []

        horarios[disc_id].append({
            "dia": row["dia"],
            "inicio": row["bloco_inicio"],
            "dur": row["quantidade_blocos"]
        })

    # =========================
    # PRÉ-REQUISITOS
    # =========================
    # Busca os pré-requisitos das disciplinas do PPC
    # Pode haver:
    # - disciplina pré-requisito
    # - créditos mínimos
    # - ambos
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    disciplina_id,
                    disciplina_pre_req_id,
                    creditos_minimos
                FROM pre_requisitos
                WHERE disciplina_id = ANY(%s)
                ORDER BY disciplina_id
            """, (disciplina_ids,))
            rows_prereq = cur.fetchall()

    # Monta a estrutura de pré-requisitos por disciplina
    pre_requisitos = {}
    for row in rows_prereq:
        disc_id = row["disciplina_id"]

        if disc_id not in pre_requisitos:
            pre_requisitos[disc_id] = {
                "disciplinas": [],
                "creditos": None
            }

        # Adiciona disciplina pré-requisito, se existir
        if row["disciplina_pre_req_id"] is not None:
            pre_requisitos[disc_id]["disciplinas"].append(row["disciplina_pre_req_id"])

        # Define a exigência de créditos mínimos, se existir
        if row["creditos_minimos"] is not None:
            pre_requisitos[disc_id]["creditos"] = row["creditos_minimos"]

    # =========================
    # EQUIVALÊNCIAS
    # =========================
    # Busca as equivalências entre disciplinas do PPC
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    disciplina_id,
                    disciplina_equivalente_id
                FROM equivalencias_disciplina
                WHERE disciplina_id = ANY(%s)
                ORDER BY disciplina_id, disciplina_equivalente_id
            """, (disciplina_ids,))
            rows_equiv = cur.fetchall()

    # Organiza as equivalências em listas por disciplina
    equivalencias = {}
    for row in rows_equiv:
        disc_id = row["disciplina_id"]
        if disc_id not in equivalencias:
            equivalencias[disc_id] = []
        equivalencias[disc_id].append(row["disciplina_equivalente_id"])

    # Cria um mapa auxiliar de nome -> id para facilitar buscas no front-end
    nome_para_id = {
        row["nome"]: row["id"]
        for row in rows_disc
    }

    # Retorna todos os dados consolidados da estrutura acadêmica do PPC do usuário
    return jsonify({
        "disciplinas": disciplinas,
        "horarios": horarios,
        "pre_requisitos": pre_requisitos,
        "equivalencias": equivalencias,
        "nome_para_id": nome_para_id
    })


@api_bp.route("/api/historico-disciplinas", methods=["GET"])
def get_historico_disciplinas():
    """
    Retorna o histórico acadêmico do usuário logado.

    Para cada disciplina encontrada no histórico, são retornados:
    - se foi concluída
    - quantidade de reprovações
    """

    # Obtém o usuário autenticado da sessão
    user_id = session.get("user_id")

    # Bloqueia acesso caso não haja login ativo
    if not user_id:
        return jsonify({"error": "Usuário não autenticado"}), 401

    # Busca no banco todas as disciplinas registradas no histórico do usuário
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    hd.disciplina_id,
                    hd.quantidade_reprovacoes,
                    hd.concluida
                FROM historico_disciplinas hd
                WHERE hd.user_id = %s
                ORDER BY hd.disciplina_id
            """, (user_id,))
            rows = cur.fetchall()

    # Organiza o histórico em um dicionário indexado pelo ID da disciplina
    historico = {
        str(row["disciplina_id"]): {
            "concluida": row["concluida"],
            "quantidade_reprovacoes": row["quantidade_reprovacoes"]
        }
        for row in rows
    }

    # Retorna o histórico do usuário para o front-end
    return jsonify({"historico": historico})


@api_bp.route("/api/historico-disciplinas", methods=["POST"])
def salvar_historico_disciplinas():
    """
    Salva o histórico acadêmico enviado pelo front-end.
    - remove todos os registros atuais do usuário
    - reinsere o estado mais recente enviado pela interface

    Regras:
    - só salva disciplinas concluídas
    - ou disciplinas com pelo menos 1 reprovação registrada
    """

    # Obtém o usuário autenticado da sessão
    user_id = session.get("user_id")

    # Impede gravação caso o usuário não esteja logado
    if not user_id:
        return jsonify({"error": "Usuário não autenticado"}), 401

    # Lê o JSON recebido no corpo da requisição
    data = request.get_json(silent=True) or {}
    registros = data.get("registros", [])

    # Valida se a estrutura recebida é uma lista
    if not isinstance(registros, list):
        return jsonify({"error": "Formato inválido"}), 400

    with get_connection() as conn:
        with conn.cursor() as cur:
            # Remove todo o histórico atual do usuário
            # A ideia é substituir completamente pelo estado novo enviado pela tela
            cur.execute("""
                DELETE FROM historico_disciplinas
                WHERE user_id = %s
            """, (user_id,))

            # Percorre todos os registros enviados pelo front-end
            for registro in registros:
                disciplina_id = registro.get("disciplina_id")
                concluida = bool(registro.get("concluida", False))
                quantidade_reprovacoes = int(registro.get("quantidade_reprovacoes", 0) or 0)

                # Ignora registros sem disciplina válida
                if not disciplina_id:
                    continue

                # Só persiste informações relevantes:
                # - disciplina concluída
                # - ou disciplina com reprovação registrada
                if not concluida and quantidade_reprovacoes <= 0:
                    continue

                # Insere o novo registro no histórico
                cur.execute("""
                    INSERT INTO historico_disciplinas (
                        user_id,
                        disciplina_id,
                        quantidade_reprovacoes,
                        concluida,
                        created_at,
                        updated_at
                    )
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, (
                    user_id,
                    disciplina_id,
                    quantidade_reprovacoes,
                    concluida
                ))

        # Confirma as alterações no banco
        conn.commit()

    # Retorna resposta de sucesso para o front-end
    return jsonify({"ok": True, "message": "Histórico salvo com sucesso"})