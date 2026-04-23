/**
 * dev-logger
 *
 * Logger de telemetria habilitado somente em ambiente de desenvolvimento
 * (process.env.NODE_ENV === "development"). Produz saída agrupada e estilizada
 * no console para facilitar o diagnóstico da pipeline de execução de tarefas
 * em Portugol (parsing, extração, transpilação, validação e execução).
 *
 * Em produção, todas as chamadas se tornam no-ops.
 */

export const IS_DEV_LOG_ENABLED =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

const STYLES = {
  header:
    "color: #e36c1c; font-weight: 700; font-size: 12px; padding: 2px 6px; border-radius: 3px; background: rgba(227,108,28,0.08);",
  subHeader: "color: #81d4fa; font-weight: 600;",
  key: "color: #a5d6a7; font-weight: 600;",
  value: "color: #eceff1;",
  warn: "color: #ffca28; font-weight: 600;",
  err: "color: #ef5350; font-weight: 700;",
  ok: "color: #66bb6a; font-weight: 600;",
  dim: "color: #90a4ae;",
  code: "color: #cfd8dc; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre;",
};

const noop = () => {};

export interface DevLogger {
  readonly enabled: boolean;
  group: (title: string, collapsed?: boolean) => void;
  groupEnd: () => void;
  section: (title: string) => void;
  info: (label: string, value?: unknown) => void;
  kv: (label: string, value: unknown) => void;
  table: (label: string, data: unknown) => void;
  code: (label: string, code: string) => void;
  list: (label: string, items: unknown[]) => void;
  ok: (label: string, value?: unknown) => void;
  warn: (label: string, value?: unknown) => void;
  error: (label: string, value?: unknown) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}

const realLogger: DevLogger = {
  enabled: true,
  group(title, collapsed = false) {
    const fn = collapsed ? console.groupCollapsed : console.group;
    fn(`%c${title}`, STYLES.header);
  },
  groupEnd() {
    console.groupEnd();
  },
  section(title) {
    console.log(`%c▸ ${title}`, STYLES.subHeader);
  },
  info(label, value) {
    if (value === undefined) {
      console.log(`%c${label}`, STYLES.value);
    } else {
      console.log(`%c${label}`, STYLES.key, value);
    }
  },
  kv(label, value) {
    console.log(`%c${label}:`, STYLES.key, value);
  },
  table(label, data) {
    console.log(`%c${label}:`, STYLES.key);
    try {
      console.table(data as any);
    } catch {
      console.log(data);
    }
  },
  code(label, code) {
    console.log(`%c${label}:`, STYLES.key);
    console.log(`%c${code}`, STYLES.code);
  },
  list(label, items) {
    console.log(`%c${label}:`, STYLES.key);
    for (const [i, item] of items.entries()) {
      console.log(`%c  [${i}]`, STYLES.dim, item);
    }
  },
  ok(label, value) {
    if (value === undefined) console.log(`%c✔ ${label}`, STYLES.ok);
    else console.log(`%c✔ ${label}`, STYLES.ok, value);
  },
  warn(label, value) {
    if (value === undefined) console.warn(`%c⚠ ${label}`, STYLES.warn);
    else console.warn(`%c⚠ ${label}`, STYLES.warn, value);
  },
  error(label, value) {
    if (value === undefined) console.error(`%c✖ ${label}`, STYLES.err);
    else console.error(`%c✖ ${label}`, STYLES.err, value);
  },
  time(label) {
    console.time(label);
  },
  timeEnd(label) {
    console.timeEnd(label);
  },
};

const noopLogger: DevLogger = {
  enabled: false,
  group: noop,
  groupEnd: noop,
  section: noop,
  info: noop,
  kv: noop,
  table: noop,
  code: noop,
  list: noop,
  ok: noop,
  warn: noop,
  error: noop,
  time: noop,
  timeEnd: noop,
};

export const devLog: DevLogger = IS_DEV_LOG_ENABLED ? realLogger : noopLogger;
