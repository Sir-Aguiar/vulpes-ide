/* eslint-disable @typescript-eslint/no-unsafe-call */
// /packages/vulpes/src/app/lib/monaco-config.ts

// Esta função irá configurar a linguagem Portugol no Monaco
export function registerPortugolLanguage(monaco: any) {
  // Evita registrar a linguagem mais de uma vez
  if (monaco.languages.getLanguages().some((lang: any) => lang.id === "portugol")) {
    return;
  }

  // --- REGISTRO DA LINGUAGEM ---
  monaco.languages.register({
    id: "portugol",
    extensions: [".por"],
    aliases: ["Portugol"],
  });

  // --- CONFIGURAÇÃO DE COMPORTAMENTO DO EDITOR ---
  monaco.languages.setLanguageConfiguration("portugol", {
    wordPattern: /(-?\d*\.\d\w*)|([^\s!"#%&'()*+,./:;<=>?@[\\\]^`{|}~\-]+)/g,
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    onEnterRules: [
      {
        beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
        afterText: /^\s*\*\/$/,
        action: {
          indentAction: monaco.languages.IndentAction.IndentOutdent,
          appendText: " * ",
        },
      },
      {
        beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
        action: {
          indentAction: monaco.languages.IndentAction.None,
          appendText: " * ",
        },
      },
      {
        beforeText: /^(\t|( {2}))* \*( ([^*]|\*(?!\/))*)?$/,
        action: {
          indentAction: monaco.languages.IndentAction.None,
          appendText: "* ",
        },
      },
      {
        beforeText: /^(\t|( {2}))* \*\/\s*$/,
        action: {
          indentAction: monaco.languages.IndentAction.None,
          removeText: 1,
        },
      },
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string", "comment"] },
      { open: "`", close: "`", notIn: ["string", "comment"] },
      { open: "/**", close: " */", notIn: ["string"] },
    ],
    folding: {
      markers: {
        start: /^\s*\/\/\s*#?region\b/,
        end: /^\s*\/\/\s*#?endregion\b/,
      },
    },
  });

  // --- DEFINIÇÃO DETALHADA DE TOKENS PARA COLORAÇÃO ---
  monaco.languages.setMonarchTokensProvider("portugol", {
    defaultToken: "invalid",
    tokenPostfix: ".portugol",
    keywords: [
      "faca",
      "enquanto",
      "para",
      "se",
      "senao",
      "const",
      "funcao",
      "programa",
      "escolha",
      "caso",
      "contrario",
      "pare",
      "retorne",
      "inclua",
      "biblioteca",
      "verdadeiro",
      "falso",
    ],
    typeKeywords: ["real", "inteiro", "vazio", "logico", "cadeia", "caracter"],
    operators: [
      "nao",
      "e",
      "ou",
      "-",
      "+",
      "*",
      "/",
      "%",
      "=",
      "==",
      "!=",
      ">",
      "<",
      "<=",
      ">=",
      "++",
      "--",
      "<<",
      ">>",
      "^",
      "|",
      "~",
      "-->",
      "&",
      "+=",
      "-=",
      "*=",
      "/=",
    ],
    symbols: /[!%&*+/:<=>?^|~\-]+/,
    escapes: /\\(?:["'\\abfnrtv]|x[\dA-Fa-f]{1,4}|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/,
    digits: /\d+(_+\d+)*/,
    octaldigits: /[0-7]+(_+[0-7]+)*/,
    binarydigits: /[01]+(_+[01]+)*/,
    hexdigits: /[\dA-F[a-f]+(_+[\dA-Fa-f]+)*/,
    tokenizer: {
      root: [[/[{}]/, "delimiter.bracket"], [/([1A-Z_a-z{}]\w+)(?=\s*\()/, "functions"], { include: "common" }],
      common: [
        [/[A-Z][\w$]*/, "type.identifier"],
        { include: "@whitespace" },
        [/[()[\]{}]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],
        [/\d*\.\d+([Ee][+\-]?\d+)?/, "number.float"],
        [/0[Xx][\dA-Fa-f]+/, "number.hex"],
        [/\d+/, "number"],
        [/[,.;]/, "delimiter"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
        [/'[^'\\]'/, "string"],
        [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
        [/'/, "string.invalid"],
        [
          /[$_a-z][\w$]*/,
          {
            cases: {
              "@typeKeywords": "keyword",
              "@keywords": "keyword",
              "@default": "identifier",
            },
          },
        ],
      ],
      comment: [
        [/[^*/]+/, "comment"],
        [/\/\*/, "comment", "@push"],
        [String.raw`\*/`, "comment", "@pop"],
        [/[*/]/, "comment"],
      ],
      string: [
        [/[^"\\]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],
      whitespace: [
        [/[\t\n\r ]+/, "white"],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],
      ],
      bracketCounting: [
        [/{/, "delimiter.bracket", "@bracketCounting"],
        [/}/, "delimiter.bracket", "@pop"],
        { include: "common" },
      ],
    },
  } as any);

  // --- DEFINIÇÃO DOS TEMAS CUSTOMIZADOS ---
  monaco.editor.defineTheme("portugol-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "functions", foreground: "F5D7A9" },
      { token: "string.escape", foreground: "D2BB85" },
      { token: "string.escape.invalid", foreground: "DF5953" },
    ],
    colors: {},
  });

  monaco.editor.defineTheme("portugol-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "functions", foreground: "AD7F00" },
      { token: "string.escape", foreground: "DC009E" },
      { token: "string.escape.invalid", foreground: "DF5953" },
    ],
    colors: {},
  });
}
