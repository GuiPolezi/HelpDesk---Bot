## HelpDesk - Bot
Versão 1.0

### Um bot criado com a finalidade em obtenção de informações, analisadas por IA, através de um texto relatado pelo usuário.
---
_Apis_
- Google Gemini Flash 2.0
- Firebase Store



Objeto JSON retornado pela IA
```
Categoria: Define uma categoria que se relaciona ao contexto descrito.

Subcategoria: Define uma subcategoria relacionada a Categoria.

Palavras_Chave: Define palavras-chave encontradas para melhorar a legibilidade do contexto descrito.

Resumo: Um breve resumo sobre o que foi descrito pelo usuário

Gravidade Estimada: Um Intervalo de Números de 0 a 5 que cria um nivel de gravidade para a situação descrita
```


### Clonando Repositório


1. No terminal digite: git clone nomedorepositorioaqui.git

2. Para entrar na pasta: cd nomedorepositorioaqui

3. npm install -> Para instalar as dependencias

4. Para garantir a versão mais recente: git pull

Dependencias desse Repositorio
- Firebase: Store and Authentication
- Google AI Studio: Criar Chave API
- Google Cloud Console: em APIs e Services -> Ativar "Generative Language API"

**Váriaveis .env**

GEMINI_API_KEY

FIREBASE_PROJECT_ID

FIREBASE_CLIENT_EMAIL

FIREBASE_PRIVATE_KEY

NEXT_PUBLIC_FIREBASE_API_KEY

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

NEXT_PUBLIC_FIREBASE_PROJECT_ID

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

NEXT_PUBLIC_FIREBASE_APP_ID

### Resumo Especificações do Sistema

- Firebase.js
```
Arquivo para configuração do Firebase
```
- app/api/analisar: route.ts
```
Arquivo para Configurações da geração da IA - Analise da IA
```
- app/components/ProtectedRoute.tsx
```
Arquivo para proteger as rotas caso usuario nao esteja logado.
```
- app/context/AuthContext.tsx
```
Arquivo para configurar o contexto de autenticação dos usuários
```
- Demais arquivos se referem à layouts e outras páginas do sistema.
