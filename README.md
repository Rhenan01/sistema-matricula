# Sistema de Matrícula Inteligente

Sistema web desenvolvido com **Python, Flask e PostgreSQL** para auxiliar alunos do **CEFET/RJ UnED Itaguaí** no processo de matrícula. O projeto foi estruturado para permitir autenticação, cadastro de usuário com **curso** e **PPC**, consulta de disciplinas conforme o PPC do aluno, registro do histórico acadêmico e geração inteligente de grade com base em **pré-requisitos**, **créditos já concluídos**, **reprovações** e **regras curriculares**.

[![Demo – GitHub Pages](https://img.shields.io/badge/demo-online-brightgreen)](https://rhenan01.github.io/SistemaMatriculaInteligente/)

---

## Sumário

- [Visão geral](#visão-geral)
- [Objetivo do sistema](#objetivo-do-sistema)
- [Principais funcionalidades](#principais-funcionalidades)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Arquitetura e organização do projeto](#arquitetura-e-organização-do-projeto)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Explicação dos principais arquivos](#explicação-dos-principais-arquivos)
- [Fluxo geral de funcionamento](#fluxo-geral-de-funcionamento)
- [Rotas do sistema](#rotas-do-sistema)
- [Rotas da API](#rotas-da-api)
- [Banco de dados](#banco-de-dados)
- [Como executar o projeto](#como-executar-o-projeto)

---

## Visão geral

O **Sistema de Matrícula Inteligente** foi criado para servir como base de uma plataforma acadêmica em que o aluno possa:

- criar uma conta no sistema
- fazer login com sua matrícula e senha
- informar seu curso e seu PPC no momento do cadastro
- acessar funcionalidades compatíveis com sua realidade curricular
- registrar as disciplinas que já concluiu
- informar a quantidade de reprovações por disciplina
- consultar apenas as disciplinas pertencentes ao seu PPC
- visualizar dados acadêmicos necessários para a montagem da grade
- gerar uma sugestão de grade mais coerente com sua trajetória acadêmica

A proposta do projeto é tornar o processo de matrícula mais inteligente, reduzindo erros manuais e aproximando a escolha das disciplinas da situação real do aluno.

---

## Objetivo do sistema

O objetivo principal do sistema é **apoiar o aluno na organização acadêmica**, utilizando informações estruturadas do curso e do histórico do usuário para montar uma grade mais adequada.

O sistema considera, entre outros fatores:

- curso selecionado
- PPC escolhido
- disciplinas já concluídas
- quantidade de reprovações
- pré-requisitos por disciplina
- exigência de créditos mínimos
- equivalências entre disciplinas
- horários cadastrados no banco

Com isso, o projeto evolui de uma simples interface de matrícula para uma base de recomendação acadêmica.

---

## Principais funcionalidades

Atualmente, o sistema já possui ou foi estruturado para possuir as seguintes funcionalidades:

- tela inicial com **login** e **cadastro**
- autenticação de usuários com sessão
- armazenamento seguro de senha com **hash**
- cadastro de usuário com:
  - nome
  - matrícula
  - e-mail
  - curso
  - PPC
- consulta de cursos e PPCs diretamente do banco de dados
- tela principal de **grade**
- tela de **histórico de disciplinas**
- registro das disciplinas já concluídas pelo usuário
- registro da quantidade de reprovações por disciplina
- persistência do histórico acadêmico no banco de dados
- API para consulta de:
  - disciplinas
  - horários
  - pré-requisitos
  - equivalências
  - mapeamento de nome para ID
- base para geração inteligente de grade com base no histórico do aluno
- interface web moderna com separação entre backend, templates e arquivos estáticos

---

## Tecnologias utilizadas

### Backend
- **Python**
- **Flask**
- **Werkzeug**
- **Psycopg**

### Frontend
- **HTML**
- **CSS**
- **JavaScript**

### Banco de dados
- **PostgreSQL**
- **pgAdmin 4**

### Ambiente de desenvolvimento
- **VS Code**
- **Ambiente virtual Python**

---

## Arquitetura e organização do projeto

O projeto está organizado em uma estrutura típica de aplicação Flask, separando:

- **rotas** do backend
- **templates HTML**
- **arquivos estáticos** (CSS, JavaScript e imagens)
- **configuração de banco**
- **arquivo principal de inicialização**

Essa separação facilita:

- manutenção do código
- escalabilidade
- leitura por outros desenvolvedores
- apresentação acadêmica e profissional do projeto

---

## Estrutura de pastas

```text
SISTEMA_MATRICULA/
│
├── ambv/
│   └── ambiente virtual Python
│
├── app/
│   │
│   ├── routes/
│   │   ├── admin.py
│   │   ├── api.py
│   │   ├── auth.py
│   │   └── main.py
│   │
│   ├── static/
│   │   ├── css/
│   │   │   ├── admin_cursos.css
│   │   │   ├── admin_dashboard.css
│   │   │   ├── admin_disciplinas.css
│   │   │   ├── admin_horarios.css
│   │   │   ├── admin_ppcs.css
│   │   │   ├── admin_usuarios.css
│   │   │   ├── grade.css
│   │   │   ├── historico_disciplinas.css
│   │   │   └── index.css
│   │   │
│   │   ├── js/
│   │   │   ├── admin_cursos.js
│   │   │   ├── admin_disciplinas.js
│   │   │   ├── admin_horarios.js
│   │   │   ├── admin_ppcs.js
│   │   │   ├── admin_usuarios.js
│   │   │   ├── grade.js
│   │   │   ├── historico_disciplinas.js
│   │   │   └── index.js
│   │   │
│   │   └── figures/
│   │       └── logo.png
│   │
│   ├── templates/
│   │   ├── admin_cursos.html
│   │   ├── admin_dashboard.html
│   │   ├── admin_disciplinas.html
│   │   ├── admin_horarios.html
│   │   ├── admin_ppcs.html
│   │   ├── admin_usuarios.html
│   │   ├── grade.html
│   │   ├── historico_disciplinas.html
│   │   └── index.html
│   │
│   ├── app.py
│   └── db.py
│
├── .gitignore
├── README.md
├── requirements.txt
└── schema.sql
```

---

## Explicação dos principais arquivos

### `app/app.py`
É o arquivo principal da aplicação Flask.

Responsabilidades:
- criar a aplicação Flask
- definir a `secret_key`
- registrar os blueprints do sistema
- executar o servidor em modo de desenvolvimento

### `app/db.py`
Arquivo responsável pela conexão com o banco de dados PostgreSQL.

Responsabilidades:
- armazenar as configurações de conexão
- abrir uma conexão com o banco
- retornar os resultados das consultas em formato de dicionário

### `app/routes/auth.py`
Arquivo responsável pelas rotas de autenticação do sistema.

Responsabilidades:
- cadastrar usuários
- validar campos obrigatórios
- verificar duplicidade de matrícula e e-mail
- gerar hash da senha
- realizar login
- criar e limpar sessão

### `app/routes/main.py`
Arquivo responsável pelas rotas principais que renderizam páginas HTML.

Responsabilidades:
- renderizar a página inicial
- carregar cursos e PPCs
- renderizar a página de grade
- renderizar a página de histórico de disciplinas
- proteger rotas que exigem login

### `app/routes/api.py`
Arquivo responsável pelas rotas de API que retornam dados em JSON.

Responsabilidades:
- retornar disciplinas do PPC do usuário
- retornar horários das disciplinas
- retornar pré-requisitos
- retornar equivalências
- retornar histórico acadêmico
- salvar histórico acadêmico

### `app/templates/index.html`
Tela inicial do sistema.

Funções principais:
- exibir formulário de login
- exibir formulário de cadastro
- permitir seleção de curso e PPC

### `app/templates/grade.html`
Tela principal de grade.

Funções principais:
- servir como base para geração e exibição da grade
- consumir dados do backend e da API

### `app/templates/historico_disciplinas.html`
Tela de histórico de disciplinas.

Funções principais:
- permitir ao usuário marcar disciplinas concluídas
- registrar quantidade de reprovações
- salvar o histórico acadêmico

### `app/static/css/`
Pasta com os estilos de cada página:
- `index.css`
- `grade.css`
- `historico_disciplinas.css`

### `app/static/js/`
Pasta com os scripts de cada página:
- `index.js`
- `grade.js`
- `historico_disciplinas.js`

---

## Fluxo geral de funcionamento

### 1. Acesso à página inicial
O usuário acessa a rota `/` e visualiza a tela inicial do sistema.

### 2. Cadastro
O usuário pode criar uma conta informando:
- nome
- matrícula
- e-mail
- senha
- curso
- PPC

### 3. Login
Após o cadastro, o usuário realiza login com matrícula e senha.

Se as credenciais estiverem corretas, o sistema cria a sessão do usuário.

### 4. Acesso às páginas internas
Depois de autenticado, o usuário pode acessar:
- a tela de grade
- a tela de histórico de disciplinas

### 5. Registro do histórico acadêmico
Na tela de histórico de disciplinas, o usuário informa:
- quais disciplinas já concluiu
- quantas reprovações possui em cada disciplina

Esses dados são salvos no banco de dados por meio da API.

### 6. Consulta de dados curriculares
O sistema consulta:
- disciplinas do PPC do usuário
- horários
- pré-requisitos
- equivalências
- créditos e demais regras curriculares

### 7. Base para geração de grade
Com os dados do histórico e do PPC, o sistema pode sugerir uma grade mais coerente com a trajetória acadêmica do aluno.

---

## Rotas do sistema

### Rotas de páginas

#### `GET /`
Renderiza a página inicial (`index.html`).

#### `GET /grade`
Renderiza a página de grade (`grade.html`).

> Rota protegida por autenticação.

#### `GET /historico-disciplinas`
Renderiza a página de histórico de disciplinas (`historico_disciplinas.html`).

### Rotas de autenticação

#### `POST /register`
Realiza o cadastro de um novo usuário.

Valida:
- campos obrigatórios
- matrícula duplicada
- e-mail duplicado

Também gera o hash da senha antes de salvar no banco.

#### `POST /login`
Realiza o login do usuário com matrícula e senha.

Em caso de sucesso, grava na sessão:
- `user_id`
- `user_name`
- `user_registration`
- `user_email`

#### `GET /logout`
Encerra a sessão do usuário autenticado.

---

## Rotas da API

### `GET /api/ppc`
Retorna os dados acadêmicos do PPC do usuário autenticado.

A resposta inclui:
- disciplinas
- horários
- pré-requisitos
- equivalências
- mapa de nome para ID

### `GET /api/historico-disciplinas`
Retorna o histórico acadêmico do usuário autenticado.

Para cada disciplina registrada, a API retorna:
- se foi concluída
- quantidade de reprovações

### `POST /api/historico-disciplinas`
Salva o histórico acadêmico enviado pelo frontend.

A lógica atual remove o histórico anterior do usuário e reinsere o estado atualizado.

---

## Banco de dados

O sistema utiliza **PostgreSQL** como banco de dados principal.

A estrutura foi pensada para suportar:

- usuários
- cursos
- PPCs
- disciplinas
- horários por disciplina
- dias da semana
- pré-requisitos
- equivalências
- histórico acadêmico por usuário

### Principais tabelas

#### `users`
Armazena os dados dos usuários cadastrados.

Campos esperados:
- `id`
- `name`
- `matricula`
- `email`
- `password_hash`
- `curso_id`
- `ppc_id`

#### `cursos`
Armazena os cursos disponíveis.

Campos esperados:
- `id`
- `nome`

#### `ppcs`
Armazena os PPCs vinculados aos cursos.

Campos esperados:
- `id`
- `curso_id`
- `codigo`

#### `disciplinas`
Armazena as disciplinas de cada PPC.

Campos esperados:
- `id`
- `nome`
- `semestre`
- `creditos`
- `carga_teorica`
- `carga_pratica`
- `tipo`
- `ppc_id`

#### `horarios_disciplina`
Relaciona disciplinas aos seus horários.

Campos esperados:
- `disciplina_id`
- `dia_semana_id`
- `bloco_inicio`
- `quantidade_blocos`

#### `dias_semana`
Tabela auxiliar para os dias da semana.

Campos esperados:
- `id`
- `sigla`
- `ordem`

#### `pre_requisitos`
Define os pré-requisitos das disciplinas.

Campos esperados:
- `disciplina_id`
- `disciplina_pre_req_id`
- `creditos_minimos`

#### `equivalencias_disciplina`
Define equivalências entre disciplinas.

Campos esperados:
- `disciplina_id`
- `disciplina_equivalente_id`

#### `historico_disciplinas`
Armazena o histórico acadêmico de cada usuário.

Campos esperados:
- `user_id`
- `disciplina_id`
- `quantidade_reprovacoes`
- `concluida`
- `created_at`
- `updated_at`

---

## Como executar o projeto

### 1. Abrir a pasta do projeto
Abra a pasta raiz do projeto no VS Code ou no terminal.

### 2. Criar e ativar o ambiente virtual

#### Windows
```bash
python -m venv ambv
ambv\Scripts\activate
```

### 3 Configurar o PostgreSQL

Para o sistema funcionar corretamente, é necessário que o PostgreSQL esteja instalado e em execução na máquina.

Além disso, é preciso:

- criar o banco de dados `sistema_matricula`
- copiar o código do arquivo `schema.sql`, colar e executar o mesmo dentro da query, para criar as tabelas do sistema
- garantir que as credenciais configuradas em `app/db.py` estejam corretas

Exemplo de configuração no arquivo `app/db.py`:

```python
DB_CONFIG = {
    "host": "localhost",
    "dbname": "sistema_matricula",
    "user": "postgres",
    "password": "1234",
    "port": 5432,
}
```

### 4 Selecionar diretório

#### Windows
```bash
cd app
```

### 5 Rodar app.py

#### Windows
```bash
python app.py
```

### 6 Abrir link gerado pela execução do passo 5

Por fim, para abrir o site, basta clicar com Ctrl + botão direito do mouse no link gerado pelo passo 5 no terminal.