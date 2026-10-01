// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');

/**
 * Camadas da aplicação (ver "Estrutura" no README).
 * Os caminhos são relativos à raiz do projeto.
 */
const ELEMENTS = [
  { type: 'core', pattern: 'src/app/core/*', capture: ['module'], partialMatch: false },
  { type: 'shared', pattern: 'src/app/shared/*', capture: ['module'], partialMatch: false },
  { type: 'feature', pattern: 'src/app/features/*', capture: ['feature'], partialMatch: false },
  { type: 'environments', pattern: 'src/environments', partialMatch: false },
  { type: 'i18n', pattern: 'src/i18n', partialMatch: false },
  { type: 'mocks', pattern: 'src/mocks', partialMatch: false },
  { type: 'testing', pattern: 'src/testing', partialMatch: false },
];

/**
 * Arquivos soltos em src/app (app.config.ts, app.routes.ts...) não pertencem a nenhuma camada:
 * eles montam a aplicação e podem importar qualquer uma.
 *
 * Regras de dependência entre camadas:
 * - core e shared não conhecem features (core recebe o que precisa por tokens de injeção);
 * - uma feature não importa outra feature (o que for comum vai para shared ou core);
 * - mocks (backend simulado) e testing (helpers de teste) não são importados pelo código da aplicação,
 *   exceto app.config.ts, que liga o mock só no ambiente de desenvolvimento.
 */
const DEPENDENCY_POLICIES = [
  {
    from: { element: { types: { anyOf: ['core', 'shared'] } } },
    disallow: { to: { element: { type: 'feature' } } },
    message:
      'core/shared não podem depender de features. Use um token de injeção (ex.: LAYOUT_SESSION).',
  },
  {
    from: { element: { type: 'feature' } },
    disallow: {
      to: {
        element: { type: 'feature', captured: { feature: '!{{from.element.captured.feature}}' } },
      },
    },
    message: 'Uma feature não pode importar outra. Mova o que é comum para shared/ ou core/.',
  },
  {
    from: { element: { types: { anyOf: ['core', 'shared', 'feature', 'environments', 'i18n'] } } },
    disallow: { to: { element: { types: { anyOf: ['mocks', 'testing'] } } } },
    message: 'mocks/ e testing/ não podem ser usados pelo código da aplicação.',
  },
];

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.spec.ts'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': ELEMENTS,
      'import/resolver': { typescript: { alwaysTryTypes: true, project: './tsconfig.json' } },
    },
    rules: {
      'boundaries/dependencies': ['error', { default: 'allow', policies: DEPENDENCY_POLICIES }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
