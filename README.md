# FatecWeek

Sistema de gerenciamento de acesso da 15a FatecWeek Osasco.

## Como o backend integra no frontend

O projeto React usa Axios centralizado em `src/api.js`.

- Base URL da API: `VITE_API_URL`.
- Se `VITE_API_URL` nao existir, usa `http://localhost:5000`.
- Token JWT fica no LocalStorage na chave `@App:token`.
- Todas as chamadas enviam `Authorization: Bearer <token>` automaticamente.

## 1) Configurar URL do backend

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:5000
```

Se sua API rodar em outra porta/host, altere esse valor.

## 2) Subir backend e frontend

Backend (ASP.NET):

```bash
dotnet run
```

Frontend:

```bash
npm install
npm run dev
```

## 3) Rotas que o frontend consome hoje

### Autenticacao

- `POST /connect/token`

### Eventos

- `GET /eventos`
- `GET /eventos/{id}`
- `POST /eventos`
- `PUT /eventos/{id}`
- `DELETE /eventos/{id}`

Obs.: ainda existe fallback legado em alguns services para rotas antigas (`/api/...`) quando necessario.

### Biometria e check-in

- `GET /alunos/ra/{ra}`
- `POST /checkins/entrada`
- `GET /checkins/ativo?alunoId={ra}&eventoId={id}`
- `PATCH /checkins/{id}/saida`

### Relatorio

- `GET /relatorio/academico?evento_id={id}`

### Estandes, expositores e palestras

Os services tentam primeiro endpoints em portugues e, se nao existirem, caem para endpoints legados em ingles.

- Estandes: `/estandes` -> fallback `/booths` -> fallback `/api/booths`
- Expositores: `/expositores` -> fallback `/exhibitors` -> fallback `/api/exhibitors`
- Palestras: `/palestras` -> fallback `/lectures` -> fallback `/api/lectures`

## 4) CORS no backend (obrigatorio em desenvolvimento)

Garanta que o backend aceite o frontend do Vite (exemplo comum):

- `http://localhost:5173`
- `http://localhost:5181` (ou outra porta que o Vite escolher)

No ASP.NET, habilite CORS para esses origins.

## 5) Checklist rapido de validacao

- Login retorna token e salva `@App:token`.
- Lista de eventos carrega.
- Tela facial registra entrada e saida com evento selecionado.
- Relatorio traz dados de `/relatorio/academico`.
- Estandes/palestras/expositores carregam no endpoint principal ou fallback.
