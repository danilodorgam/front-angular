# sugestao-front

Exemplo de arquitetura front-end com **Angular 21** (standalone, signals, zoneless), **Vitest** para testes
unitários e acessibilidade seguindo o **e-MAG** (Modelo de Acessibilidade em Governo Eletrônico).

## Como rodar

```bash
npm install
npm start            # http://localhost:4200 (ambiente development, com backend simulado)
npm test             # Vitest em modo watch
npm run test:ci      # Vitest uma vez (CI)
npm run test:coverage
npm run build        # produção
npm run build:hmg    # homologação
```

> Requer Node.js 20.19+, 22.12+ ou 24+.

No ambiente `development` o backend é simulado (`src/mocks`). Credenciais de teste:
**admin@exemplo.gov.br** / **Senha@123**. Pesquise por `erro500` na lista de itens para ver o tratamento de erro.

## Estrutura

```
src/
├── environments/        # Configuração por ambiente (URL do backend, timeout, idioma, flags)
├── app/
│   ├── app.config.ts    # Providers globais (router, http, interceptors, i18n, acessibilidade)
│   ├── app.routes.ts    # Rotas de 1º nível com lazy loading
│   ├── app.navigation.ts# Itens do menu lateral
│   ├── core/
│   │   ├── layout/          # Shell: menu lateral, cabeçalho, corpo e rodapé
│   │   ├── accessibility/   # Barra e-MAG, alto contraste, fonte, títulos, anúncios, página de acessibilidade
│   │   ├── error-handling/  # Interceptor HTTP, ErrorHandler global, notificações, páginas de erro
│   │   └── localization/    # TranslationService, pipe translate, seletor de idioma, locales
│   ├── shared/
│   │   ├── forms/           # text, email, number, textarea, field-error, form-error-summary
│   │   ├── validation/      # validators + mapeamento erro → mensagem traduzida
│   │   └── utils/
│   └── features/
│       ├── auth/            # sign-in, password-recovery, data-access (service, guard, interceptor)
│       └── estoque/         # inventory-list, item-detail, item-edit, data-access
├── i18n/{pt-BR,en}/     # Catálogos de tradução (JSON por domínio)
├── assets/              # Imagens e estilos globais (tokens, base, forms, components)
├── mocks/               # Backend simulado (somente dev)
└── testing/             # Helpers de teste
```

## Ambientes

Todos os arquivos `src/environments/environment*.ts` implementam a interface `AppEnvironment`, então um campo
esquecido vira erro de compilação. O Angular CLI troca o arquivo no build (`fileReplacements` no `angular.json`):

| Configuração  | Arquivo                      | Comando             |
| ------------- | ---------------------------- | ------------------- |
| `development` | `environment.development.ts` | `npm start`         |
| `homologacao` | `environment.homologacao.ts` | `npm run build:hmg` |
| `production`  | `environment.ts`             | `npm run build`     |

Nos serviços, use `inject(APP_ENVIRONMENT)` em vez de importar o arquivo, assim os testes podem sobrescrever a
configuração. Para criar um novo ambiente: copie um arquivo, adicione a configuração em `angular.json` e um script
em `package.json`.

## Acessibilidade (e-MAG)

| Recurso                                                             | Onde                                   |
| ------------------------------------------------------------------- | -------------------------------------- |
| Atalhos Alt+1 (conteúdo), Alt+2 (menu), Alt+4 (rodapé)              | `core/accessibility/accessibility-bar` |
| Alto contraste e ajuste de fonte (salvos no navegador)              | `AccessibilityService`                 |
| `lang` do `<html>` atualizado ao trocar idioma                      | `TranslationService`                   |
| Título descritivo por página + anúncio de navegação para leitores   | `AppTitleStrategy`, `LiveAnnouncer`    |
| Foco movido para o conteúdo após navegar                            | `Shell`                                |
| Label associado, dica e erro via `aria-describedby`, `aria-invalid` | `shared/forms/base-field.ts`           |
| Erro não depende só da cor (borda + ícone + texto)                  | `assets/styles/_forms.scss`            |
| Resumo de erros focado com links para os campos                     | `FormErrorSummary`                     |
| Mensagens de erro não somem sozinhas                                | `NotificationService`                  |
| Página "Acessibilidade" descrevendo os recursos                     | `/acessibilidade`                      |

## Formulários

Os campos recebem o `FormControl` por input e as regras ficam explícitas no formulário:

```ts
form = this.fb.group({
  email: ['', [Validators.required, AppValidators.email]],
  quantity: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
});
```

```html
<app-email-field inputId="email" label="auth.signIn.email" [control]="form.controls.email" />
<app-number-field
  inputId="qtd"
  label="estoque.fields.quantity"
  [control]="form.controls.quantity"
/>
```

O `label`/`hint` são chaves de tradução. O erro aparece quando o usuário sai do campo ou quando o formulário chama
`markAllAsTouched()` no envio.

## Tratamento de erros

- `httpErrorInterceptor`: timeout, retry de GET em falhas transitórias, conversão para `AppError` e notificação
  traduzida.
- Telas que tratam um status sozinhas declaram isso com `handledErrors(404)` no `HttpContext`.
- Erros de validação do backend (`{ "errors": { "campo": "mensagem" } }`) aparecem no próprio campo.
- `GlobalErrorHandler` captura exceções não tratadas.

## Design system

A identidade visual está definida em [`DESIGN.md`](DESIGN.md) (formato
[Google DESIGN.md](https://github.com/google-labs-code/design.md): tokens normativos em YAML +
racional em prosa). Os mesmos valores vivem como custom properties em
`src/assets/styles/_tokens.scss` — cor, tipografia, espaçamento, raio, sombra, z-index e tamanhos
de toque. **Nenhum componente declara cor, tamanho de fonte ou sombra diretamente**; o Stylelint
bloqueia hex/`rgb()` fora de `_tokens.scss` e exige classes no padrão BEM.

```bash
npm run lint:style     # Stylelint (tokens, BEM, SCSS)
npm run design:lint    # valida DESIGN.md: referências, ordem das seções e contraste WCAG
npm run design:export  # exporta tokens no formato W3C DTCG (design-tokens.json)
```

Ao mudar um valor: edite `DESIGN.md` → espelhe em `_tokens.scss` → `npm run design:lint`.

## Pipeline

`npm run ci` reproduz localmente o que o GitHub Actions roda em cada PR (`.github/workflows/ci.yml`):

| Job       | O que verifica                                                                       |
| --------- | ------------------------------------------------------------------------------------ |
| `quality` | Prettier, ESLint (se existir), Stylelint, lint do `DESIGN.md`                        |
| `test`    | Vitest com cobertura (artefato `coverage/`)                                          |
| `build`   | Build `production` e `homologacao`; falha se a credencial do mock aparecer no bundle |
| `audit`   | `npm audit` de dependências de produção (nível `high`)                               |

Marque os três primeiros como _required status checks_ na proteção da branch `main`.

**Homologação (stg):** `.github/workflows/deploy-stg.yml` publica o build `homologacao` no GitHub
Pages a cada push na `main` (environment `staging`, com URL no PR). Ative em _Settings → Pages →
Source: GitHub Actions_. Para outra hospedagem, troque só o job `deploy`; o artefato já sai pronto.

Dependabot abre PRs semanais agrupando `@angular/*` e ferramentas de dev.
