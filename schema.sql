-- =========================================================
-- TABELA DE CURSOS
-- =========================================================
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- =========================================================
-- TABELA DE PPCS
-- =========================================================
CREATE TABLE ppcs (
    id SERIAL PRIMARY KEY,
    curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    UNIQUE (curso_id, codigo)
);

-- =========================================================
-- TABELA DE USUÁRIOS
-- =========================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    curso_id INTEGER REFERENCES cursos(id),
    ppc_id INTEGER REFERENCES ppcs(id),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- =========================================================
-- TABELAS AUXILIARES DE HORÁRIO
-- =========================================================
CREATE TABLE dias_semana (
    id SERIAL PRIMARY KEY,
    sigla VARCHAR(3) NOT NULL UNIQUE,
    nome VARCHAR(20) NOT NULL UNIQUE,
    ordem SMALLINT NOT NULL UNIQUE
);

CREATE TABLE blocos_horario (
    id SERIAL PRIMARY KEY,
    tipo_grade VARCHAR(20) NOT NULL,
    ordem SMALLINT NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    UNIQUE (tipo_grade, ordem),
    UNIQUE (tipo_grade, hora_inicio, hora_fim)
);

-- =========================================================
-- TABELA DE DISCIPLINAS
-- Agora com vínculo ao PPC
-- UNIQUE alterado para permitir mesma disciplina em PPCs diferentes
-- =========================================================
CREATE TABLE disciplinas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    semestre SMALLINT NOT NULL,
    creditos SMALLINT NOT NULL,
    carga_teorica SMALLINT NOT NULL DEFAULT 0,
    carga_pratica SMALLINT NOT NULL DEFAULT 0,
    tipo VARCHAR(20) NOT NULL DEFAULT 'regular',
    ppc_id INTEGER NOT NULL REFERENCES ppcs(id) ON DELETE CASCADE,
    UNIQUE (nome, ppc_id)
);

-- =========================================================
-- TABELA DE HORÁRIOS DAS DISCIPLINAS
-- =========================================================
CREATE TABLE horarios_disciplina (
    id SERIAL PRIMARY KEY,
    disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
    dia_semana_id INTEGER NOT NULL REFERENCES dias_semana(id),
    bloco_inicio SMALLINT NOT NULL,
    quantidade_blocos SMALLINT NOT NULL CHECK (quantidade_blocos > 0)
);

-- =========================================================
-- TABELA DE PRÉ-REQUISITOS
-- =========================================================
CREATE TABLE pre_requisitos (
    id SERIAL PRIMARY KEY,
    disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
    disciplina_pre_req_id INTEGER REFERENCES disciplinas(id) ON DELETE CASCADE,
    creditos_minimos INTEGER,
    CHECK (
        disciplina_pre_req_id IS NOT NULL
        OR creditos_minimos IS NOT NULL
    )
);

-- =========================================================
-- TABELA DE EQUIVALÊNCIAS
-- =========================================================
CREATE TABLE equivalencias_disciplina (
    id SERIAL PRIMARY KEY,
    disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
    disciplina_equivalente_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
    UNIQUE (disciplina_id, disciplina_equivalente_id),
    CHECK (disciplina_id <> disciplina_equivalente_id)
);

-- =========================================================
-- TABELA DE HISTÓRICO DE DISCIPLINAS DO USUÁRIO
-- =========================================================
CREATE TABLE historico_disciplinas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
    quantidade_reprovacoes INTEGER NOT NULL DEFAULT 0,
    concluida BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, disciplina_id)
);

-- =========================================================
-- ÍNDICE ÚTIL PARA CONSULTAS POR PPC
-- =========================================================
CREATE INDEX idx_disciplinas_ppc_id ON disciplinas(ppc_id);

-- =========================================================
-- INSERTS BASE
-- =========================================================
INSERT INTO cursos (nome) VALUES
('Engenharia de Produção'),
('Engenharia Mecânica');

INSERT INTO ppcs (curso_id, codigo) VALUES
(1, '2019'),
(1, '2023.2'),
(2, '2019'),
(2, '2023.2');

INSERT INTO dias_semana (sigla, nome, ordem) VALUES
('Seg', 'Segunda-feira', 1),
('Ter', 'Terça-feira', 2),
('Qua', 'Quarta-feira', 3),
('Qui', 'Quinta-feira', 4),
('Sex', 'Sexta-feira', 5),
('Sab', 'Sábado', 6);

INSERT INTO blocos_horario (tipo_grade, ordem, hora_inicio, hora_fim) VALUES
('semana', 1, '07:00', '07:50'),
('semana', 2, '07:50', '08:40'),
('semana', 3, '08:40', '09:30'),
('semana', 4, '09:30', '10:20'),
('semana', 5, '10:40', '11:30'),
('semana', 6, '11:30', '12:20'),
('semana', 7, '12:20', '13:10'),
('semana', 8, '13:10', '14:00'),
('semana', 9, '14:00', '14:50'),
('semana',10, '14:50', '15:40'),
('semana',11, '15:40', '16:30'),
('semana',12, '16:40', '17:30'),
('semana',13, '17:30', '18:20'),
('semana',14, '18:20', '19:10'),
('semana',15, '19:10', '20:00'),
('semana',16, '20:10', '21:00'),
('semana',17, '21:00', '21:50'),
('semana',18, '21:50', '22:40'),
('sabado', 1, '07:00', '07:50'),
('sabado', 2, '07:50', '08:40'),
('sabado', 3, '08:40', '09:30'),
('sabado', 4, '09:30', '10:20'),
('sabado', 5, '10:40', '11:30'),
('sabado', 6, '11:30', '12:20'),
('sabado', 7, '12:20', '13:10');

-- =========================================================
-- DISCIPLINAS DO PPC 2
-- Engenharia de Produção / 2023.2
-- =========================================================
INSERT INTO disciplinas (nome, semestre, creditos, carga_teorica, carga_pratica, tipo, ppc_id) VALUES
-- 1º Semestre
('Introdução a Administração', 1, 2, 2, 0, 'regular', 2),
('Introdução a Engenharia', 1, 2, 2, 0, 'regular', 2),
('Cálculo a uma Variável', 1, 6, 6, 0, 'regular', 2),
('Álgebra Linear I', 1, 2, 2, 0, 'regular', 2),
('Química Geral', 1, 2, 2, 0, 'regular', 2),
('Desenho', 1, 4, 4, 0, 'regular', 2),

-- 2º Semestre
('Álgebra Linear II', 2, 3, 3, 0, 'regular', 2),
('Cálculo a Várias Variáveis', 2, 4, 4, 0, 'regular', 2),
('Física I', 2, 5, 4, 2, 'regular', 2),
('Introdução a Economia', 2, 2, 2, 0, 'regular', 2),
('Química Experimental', 2, 2, 1, 2, 'regular', 2),
('Programação', 2, 3, 2, 2, 'regular', 2),
('Humanidades e Ciências Sociais', 2, 2, 2, 0, 'regular', 2),

-- 3º Semestre
('Física II', 3, 5, 4, 2, 'regular', 2),
('EDO', 3, 4, 4, 0, 'regular', 2),
('Cálculo Vetorial', 3, 2, 2, 0, 'regular', 2),
('Engenharia de Métodos', 3, 3, 3, 0, 'regular', 2),
('Cálculo Numérico', 3, 3, 2, 2, 'regular', 2),
('Mecânica Geral', 3, 4, 4, 0, 'regular', 2),
('Economia da Produção', 3, 3, 3, 0, 'regular', 2),

-- 4º Semestre
('EDPS', 4, 3, 3, 0, 'regular', 2),
('Estatística', 4, 3, 3, 0, 'regular', 2),
('Física III', 4, 5, 4, 2, 'regular', 2),
('Psicologia e Sociologia do Trabalho', 4, 3, 3, 0, 'regular', 2),
('Resistência de Materiais III', 4, 3, 3, 0, 'regular', 2),
('Desenho Técnico', 4, 3, 3, 0, 'regular', 2),
('Metodologia Cientifica', 4, 2, 2, 0, 'regular', 2),

-- 5º Semestre
('Eletricidade Aplicada', 5, 4, 4, 0, 'regular', 2),
('Métodos Estatísticos', 5, 3, 3, 0, 'regular', 2),
('Gestão da Informação I', 5, 3, 3, 0, 'regular', 2),
('Ciência do Ambiente', 5, 2, 2, 0, 'regular', 2),
('Fenômenos de Transorte', 5, 3, 3, 0, 'regular', 2),
('Ciência dos Materiais', 5, 3, 3, 0, 'regular', 2),

-- 6º Semestre
('Ergonomia', 6, 2, 2, 0, 'regular', 2),
('Pesquisa Operacional I', 6, 3, 3, 0, 'regular', 2),
('Fundamentos da Engenharia de Segurança', 6, 2, 2, 0, 'regular', 2),
('Processo de Fabricação', 6, 4, 4, 0, 'regular', 2),
('Contabilidade Gerencial', 6, 3, 3, 0, 'regular', 2),
('Estatística da Qualidade e Confiabilidade', 6, 3, 3, 0, 'regular', 2),

-- 7º Semestre
('Gestão Ambiental', 7, 3, 3, 0, 'regular', 2),
('Pesquisa Operacional II', 7, 3, 3, 0, 'regular', 2),
('Gestão Emprendedora', 7, 3, 3, 0, 'regular', 2),
('Engenharia Econômica', 7, 3, 3, 0, 'regular', 2),
('Gestão da Qualidade', 7, 3, 3, 0, 'regular', 2),
('Custos Industriais', 7, 3, 3, 0, 'regular', 2),

-- 8º Semestre
('Projeto do Produto', 8, 3, 3, 0, 'regular', 2),
('Simulação', 8, 3, 2, 2, 'regular', 2),
('Logística I', 8, 3, 3, 0, 'regular', 2),
('P.C.P I', 8, 3, 3, 0, 'regular', 2),
('Gestão de Projeto', 8, 3, 3, 0, 'regular', 2),
('Gestão da Manutenção', 8, 3, 3, 0, 'regular', 2),

-- 9º Semestre
('Projeto Final I', 9, 1, 0, 2, 'regular', 2),
('Gestão Estratégica', 9, 3, 3, 0, 'regular', 2),
('Gestão da Inovação', 9, 3, 3, 0, 'regular', 2),
('Logística II', 9, 3, 3, 0, 'regular', 2),
('P.C.P II', 9, 3, 3, 0, 'regular', 2),
('Planejamento das Instalações', 9, 2, 1, 2, 'regular', 2),

-- 10º Semestre
('Projeto Final II', 10, 1, 0, 2, 'regular', 2),
('Análise Organizacional', 10, 2, 2, 0, 'regular', 2),
('Estágio Supervisionado', 10, 7, 7, 0, 'regular', 2),
('Ciência de Dados', 10, 3, 2, 2, 'regular', 2),

-- Optativas
('Excel Aplicado a Negócios', 0, 3, 2, 2, 'optativa', 2),
('Int. Comércio Exterior', 0, 3, 3, 0, 'optativa', 2),
('Estatística Multivariada', 0, 3, 3, 0, 'optativa', 2),
('Banco de Dados', 0, 3, 2, 2, 'optativa', 2),
('Metrologia', 0, 3, 2, 2, 'optativa', 2),

-- Turmas Extras
('Cálculo a uma Variável (Ext)', 11, 6, 6, 0, 'extra', 2),
('Álgebra Linear I (Ext)', 11, 2, 2, 0, 'extra', 2),
('Química Geral (Ext)', 11, 2, 2, 0, 'extra', 2),
('Desenho (Ext)', 11, 4, 4, 0, 'extra', 2);

-- =========================================================
-- HORÁRIOS DAS DISCIPLINAS DO PPC 2
-- =========================================================
INSERT INTO horarios_disciplina (disciplina_id, dia_semana_id, bloco_inicio, quantidade_blocos)
SELECT d.id, ds.id, v.bloco_inicio, v.quantidade_blocos
FROM (
    VALUES
    ('Introdução a Administração', 'Ter', 13, 2),
    ('Introdução a Engenharia', 'Seg', 11, 2),
    ('Cálculo a uma Variável', 'Seg', 7, 2),
    ('Cálculo a uma Variável', 'Ter', 7, 2),
    ('Cálculo a uma Variável', 'Qui', 7, 2),
    ('Álgebra Linear I', 'Qui', 11, 2),
    ('Química Geral', 'Qua', 9, 2),
    ('Desenho', 'Seg', 9, 2),
    ('Desenho', 'Ter', 9, 2),

    ('Álgebra Linear II', 'Qua', 7, 3),
    ('Cálculo a Várias Variáveis', 'Ter', 11, 2),
    ('Cálculo a Várias Variáveis', 'Qua', 10, 2),
    ('Física I', 'Seg', 11, 2),
    ('Física I', 'Sex', 8, 4),
    ('Introdução a Economia', 'Qui', 10, 2),
    ('Química Experimental', 'Ter', 8, 3),
    ('Programação', 'Seg', 7, 4),
    ('Humanidades e Ciências Sociais', 'Qui', 8, 2),

    ('Física II', 'Seg', 7, 4),
    ('Física II', 'Qua', 13, 2),
    ('EDO', 'Ter', 9, 2),
    ('EDO', 'Qui', 9, 2),
    ('Cálculo Vetorial', 'Ter', 13, 2),
    ('Engenharia de Métodos', 'Qua', 7, 3),
    ('Cálculo Numérico', 'Seg', 11, 2),
    ('Cálculo Numérico', 'Sex', 8, 2),
    ('Mecânica Geral', 'Ter', 11, 2),
    ('Mecânica Geral', 'Qui', 11, 2),
    ('Economia da Produção', 'Qua', 10, 3),

    ('EDPS', 'Qua', 7, 3),
    ('Estatística', 'Ter', 8, 3),
    ('Física III', 'Seg', 11, 2),
    ('Física III', 'Seg', 15, 2),
    ('Física III', 'Ter', 11, 2),
    ('Psicologia e Sociologia do Trabalho', 'Qua', 14, 3),
    ('Resistência de Materiais III', 'Qua', 11, 3),
    ('Desenho Técnico', 'Qui', 8, 3),
    ('Metodologia Cientifica', 'Sex', 7, 2),

    ('Eletricidade Aplicada', 'Seg', 13, 2),
    ('Eletricidade Aplicada', 'Ter', 13, 2),
    ('Métodos Estatísticos', 'Sex', 15, 3),
    ('Gestão da Informação I', 'Qua', 10, 3),
    ('Ciência do Ambiente', 'Qua', 11, 2),
    ('Fenômenos de Transorte', 'Qui', 8, 3),
    ('Ciência dos Materiais', 'Ter', 10, 3),

    ('Ergonomia', 'Qua', 12, 3),
    ('Pesquisa Operacional I', 'Qui', 8, 3),
    ('Fundamentos da Engenharia de Segurança', 'Ter', 10, 3),
    ('Processo de Fabricação', 'Seg', 13, 3),
    ('Processo de Fabricação', 'Qui', 15, 2),
    ('Contabilidade Gerencial', 'Sex', 11, 3),
    ('Estatística da Qualidade e Confiabilidade', 'Sab', 3, 3),

    ('Gestão Ambiental', 'Qui', 9, 3),
    ('Pesquisa Operacional II', 'Sex', 14, 3),
    ('Gestão Emprendedora', 'Qui', 11, 3),
    ('Engenharia Econômica', 'Qua', 14, 3),
    ('Gestão da Qualidade', 'Qui', 11, 3),
    ('Custos Industriais', 'Seg', 11, 3),

    ('Projeto do Produto', 'Qui', 15, 3),
    ('Simulação', 'Seg', 13, 2),
    ('Simulação', 'Qua', 13, 2),
    ('Logística I', 'Qua', 10, 3),
    ('P.C.P I', 'Ter', 15, 2),
    ('P.C.P I', 'Qua', 15, 2),
    ('Gestão de Projeto', 'Ter', 10, 3),
    ('Gestão da Manutenção', 'Qua', 11, 3),

    ('Projeto Final I', 'Ter', 9, 4),
    ('Gestão Estratégica', 'Qui', 14, 3),
    ('Gestão da Inovação', 'Qua', 10, 3),
    ('Logística II', 'Seg', 13, 2),
    ('Logística II', 'Qua', 13, 2),
    ('P.C.P II', 'Qua', 15, 2),
    ('Planejamento das Instalações', 'Ter', 13, 3),

    ('Projeto Final II', 'Qua', 11, 3),
    ('Análise Organizacional', 'Seg', 10, 3),
    ('Estágio Supervisionado', 'Qua', 8, 2),
    ('Ciência de Dados', 'Ter', 11, 4),

    ('Excel Aplicado a Negócios', 'Seg', 13, 4),
    ('Int. Comércio Exterior', 'Qua', 10, 3),
    ('Estatística Multivariada', 'Sex', 12, 3),
    ('Banco de Dados', 'Ter', 7, 4),
    ('Metrologia', 'Qui', 15, 2),
    ('Metrologia', 'Sex', 13, 2),

    ('Cálculo a uma Variável (Ext)', 'Seg', 13, 2),
    ('Cálculo a uma Variável (Ext)', 'Ter', 13, 2),
    ('Cálculo a uma Variável (Ext)', 'Qui', 13, 2),
    ('Álgebra Linear I (Ext)', 'Sex', 15, 2),
    ('Química Geral (Ext)', 'Seg', 13, 4),
    ('Desenho (Ext)', 'Sab', 2, 4)
) AS v(nome_disciplina, sigla_dia, bloco_inicio, quantidade_blocos)
JOIN disciplinas d
  ON d.nome = v.nome_disciplina
 AND d.ppc_id = 2
JOIN dias_semana ds
  ON ds.sigla = v.sigla_dia;

SELECT
    d.nome,
    ds.sigla,
    hd.bloco_inicio,
    hd.quantidade_blocos
FROM horarios_disciplina hd
JOIN disciplinas d ON d.id = hd.disciplina_id
JOIN dias_semana ds ON ds.id = hd.dia_semana_id
ORDER BY d.nome, ds.ordem, hd.bloco_inicio;

-- =========================================================
-- PRÉ-REQUISITOS DO PPC 2
-- =========================================================
INSERT INTO pre_requisitos (disciplina_id, disciplina_pre_req_id, creditos_minimos)
SELECT d.id, pr.id, NULL
FROM (
    VALUES
    ('Álgebra Linear II', 'Álgebra Linear I'),
    ('Cálculo a Várias Variáveis', 'Cálculo a uma Variável'),
    ('Física I', 'Álgebra Linear I'),
    ('Física I', 'Cálculo a uma Variável'),
    ('Física II', 'Física I'),
    ('EDO', 'Álgebra Linear II'),
    ('EDO', 'Cálculo a uma Variável'),
    ('Cálculo Vetorial', 'Cálculo a Várias Variáveis'),
    ('Engenharia de Métodos', 'Introdução a Administração'),
    ('Cálculo Numérico', 'Álgebra Linear I'),
    ('Cálculo Numérico', 'Cálculo a uma Variável'),
    ('Cálculo Numérico', 'Programação'),
    ('Mecânica Geral', 'Física I'),
    ('Mecânica Geral', 'Álgebra Linear II'),
    ('Economia da Produção', 'Introdução a Economia'),
    ('EDPS', 'EDO'),
    ('Estatística', 'Cálculo a Várias Variáveis'),
    ('Física III', 'Física II'),
    ('Psicologia e Sociologia do Trabalho', 'Introdução a Economia'),
    ('Resistência de Materiais III', 'Mecânica Geral'),
    ('Desenho Técnico', 'Desenho'),
    ('Metodologia Cientifica', 'Introdução a Engenharia'),
    ('Eletricidade Aplicada', 'Física II'),
    ('Métodos Estatísticos', 'EDPS'),
    ('Métodos Estatísticos', 'Estatística'),
    ('Gestão da Informação I', 'Engenharia de Métodos'),
    ('Fenômenos de Transorte', 'Física III'),
    ('Ergonomia', 'Psicologia e Sociologia do Trabalho'),
    ('Pesquisa Operacional I', 'Cálculo Vetorial'),
    ('Pesquisa Operacional I', 'Gestão da Informação I'),
    ('Fundamentos da Engenharia de Segurança', 'Psicologia e Sociologia do Trabalho'),
    ('Processo de Fabricação', 'Ciência dos Materiais'),
    ('Contabilidade Gerencial', 'Introdução a Economia'),
    ('Estatística da Qualidade e Confiabilidade', 'Métodos Estatísticos'),
    ('Gestão Ambiental', 'Ciência do Ambiente'),
    ('Pesquisa Operacional II', 'Pesquisa Operacional I'),
    ('Gestão Emprendedora', 'Gestão da Informação I'),
    ('Engenharia Econômica', 'Contabilidade Gerencial'),
    ('Gestão da Qualidade', 'Estatística da Qualidade e Confiabilidade'),
    ('Custos Industriais', 'Contabilidade Gerencial'),
    ('Projeto do Produto', 'Ergonomia'),
    ('Projeto do Produto', 'Gestão da Qualidade'),
    ('Simulação', 'Métodos Estatísticos'),
    ('Simulação', 'Pesquisa Operacional II'),
    ('Logística I', 'Pesquisa Operacional I'),
    ('P.C.P I', 'Engenharia Econômica'),
    ('Gestão de Projeto', 'Engenharia Econômica'),
    ('Gestão da Manutenção', 'Gestão da Qualidade'),
    ('Gestão Estratégica', 'Gestão Emprendedora'),
    ('Gestão da Inovação', 'Gestão Emprendedora'),
    ('Logística II', 'Logística I'),
    ('P.C.P II', 'P.C.P I'),
    ('Planejamento das Instalações', 'Simulação'),
    ('Projeto Final II', 'Projeto Final I'),
    ('Análise Organizacional', 'Gestão Emprendedora'),
    ('Ciência de Dados', 'Pesquisa Operacional I'),
    ('Excel Aplicado a Negócios', 'Programação'),
    ('Estatística Multivariada', 'Cálculo a Várias Variáveis'),
    ('Estatística Multivariada', 'Pesquisa Operacional I'),
    ('Banco de Dados', 'Programação'),
    ('Metrologia', 'Estatística da Qualidade e Confiabilidade')
) AS v(disciplina, prerequisito)
JOIN disciplinas d
  ON d.nome = v.disciplina
 AND d.ppc_id = 2
JOIN disciplinas pr
  ON pr.nome = v.prerequisito
 AND pr.ppc_id = 2

UNION ALL

SELECT d.id, NULL, v.creditos_minimos
FROM (
    VALUES
    ('Projeto Final I', 140),
    ('Estágio Supervisionado', 120)
) AS v(disciplina, creditos_minimos)
JOIN disciplinas d
  ON d.nome = v.disciplina
 AND d.ppc_id = 2;

SELECT
    d.nome AS disciplina,
    pr.nome AS prerequisito_disciplina,
    p.creditos_minimos
FROM pre_requisitos p
JOIN disciplinas d ON d.id = p.disciplina_id
LEFT JOIN disciplinas pr ON pr.id = p.disciplina_pre_req_id
ORDER BY d.nome, pr.nome, p.creditos_minimos;

-- =========================================================
-- EQUIVALÊNCIAS DO PPC 2
-- =========================================================
INSERT INTO equivalencias_disciplina (disciplina_id, disciplina_equivalente_id)
SELECT d1.id, d2.id
FROM (
    VALUES
    ('Cálculo a uma Variável', 'Cálculo a uma Variável (Ext)'),
    ('Álgebra Linear I', 'Álgebra Linear I (Ext)'),
    ('Química Geral', 'Química Geral (Ext)'),
    ('Desenho', 'Desenho (Ext)')
) AS v(disciplina, equivalente)
JOIN disciplinas d1
  ON d1.nome = v.disciplina
 AND d1.ppc_id = 2
JOIN disciplinas d2
  ON d2.nome = v.equivalente
 AND d2.ppc_id = 2

UNION ALL

SELECT d2.id, d1.id
FROM (
    VALUES
    ('Cálculo a uma Variável', 'Cálculo a uma Variável (Ext)'),
    ('Álgebra Linear I', 'Álgebra Linear I (Ext)'),
    ('Química Geral', 'Química Geral (Ext)'),
    ('Desenho', 'Desenho (Ext)')
) AS v(disciplina, equivalente)
JOIN disciplinas d1
  ON d1.nome = v.disciplina
 AND d1.ppc_id = 2
JOIN disciplinas d2
  ON d2.nome = v.equivalente
 AND d2.ppc_id = 2;

SELECT
    d1.nome AS disciplina,
    d2.nome AS equivalente
FROM equivalencias_disciplina e
JOIN disciplinas d1 ON d1.id = e.disciplina_id
JOIN disciplinas d2 ON d2.id = e.disciplina_equivalente_id
ORDER BY d1.nome;