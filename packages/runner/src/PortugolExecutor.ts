import { PortugolCodeError, PortugolErrorListener } from "@portugol-webstudio/antlr";
import { PortugolErrorChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";
import { Subject, Subscription } from "rxjs";

import { IPortugolRunner, PortugolEvent, PortugolMessage } from "./runners/IPortugolRunner.js";

/**
 * Orquestra todo o processo de execução de um código Portugol.
 *
 * Esta classe atua como uma fachada, simplificando a interação entre a interface do usuário (UI)
 * e o pipeline de execução de código. Ela gerencia o estado da execução, lida com a
 * compilação (transpilação), gerencia os canais de entrada (stdin) e saída (stdout) de dados,
 * e delega a execução real para uma implementação de `IPortugolRunner` (como o `PortugolWebWorkersRunner`).
 *
 * @example
 * ```typescript
 * // Em um componente React
 * useEffect(() => {
 * const executor = new PortugolExecutor(PortugolWebWorkersRunner);
 *
 * // Inscreve-se para receber a saída do console
 * executor.stdOut$.subscribe(output => setConsoleOutput(output));
 *
 * // Inscreve-se para saber quando o programa está esperando por um `leia()`
 * executor.waitingForInput$.subscribe(isWaiting => setShowInput(isWaiting));
 *
 * // Para executar o código:
 * // executor.run(meuCodigoEmPortugol);
 *
 * // Para fornecer entrada para um `leia()`:
 * // executor.stdIn$.next(valorDoInput);
 * }, []);
 * ```
 */
export class PortugolExecutor {
  private _runner?: IPortugolRunner;

  constructor(private runner: typeof IPortugolRunner) {
    this.stdIn.subscribe(data => {
      if (data === "\b") {
        if (this.stdInBuffer.length > 0) {
          this.stdInBuffer = this.stdInBuffer.slice(0, -1);
          this.stdOut = this.stdOut.slice(0, -1);
        }
      } else if (data === "\r") {
        this._runner?.stdIn.next(this.stdInBuffer);
        this.stdInBuffer = "";
        this.stdOut += "\n";
      } else {
        this.stdInBuffer += data;
        this.stdOut += data;
      }

      this.stdOut$.next(this.stdOut);
    });
  }

  /**
   * O código JavaScript transpilado a partir do último código Portugol executado.
   * Útil para fins de depuração.
   */
  byteCode = "";

  /**
   * Buffer que armazena a entrada do usuário antes de ser enviada para a execução.
   * @internal
   */
  stdInBuffer = "";

  /**
   * O stream (canal) para enviar dados de entrada para o programa em execução.
   * Use este `Subject` para fornecer os dados que um comando `leia()` está esperando.
   *
   * @example
   * executor.stdIn.next("valor digitado pelo usuário\n");
   */
  stdIn = new Subject<string>();

  /**
   * Armazena o conteúdo completo do console de saída (`stdout`) do programa.
   */
  stdOut = "";

  /**
   * Um stream (canal) que emite o conteúdo completo de `stdOut` sempre que ele é atualizado.
   * Inscreva-se neste `Subject` para exibir a saída do programa na interface do usuário.
   */
  stdOut$ = new Subject<string>();
  private _stdOut$?: Subscription;

  /**
   * Flag que indica se a execução está atualmente pausada, aguardando uma entrada
   * do usuário (devido a um comando `leia()`).
   */
  waitingForInput = false;

  /**
   * Um stream (canal) que emite `true` quando a execução pausa para aguardar uma entrada
   * e `false` quando a entrada é recebida e a execução é retomada.
   * Inscreva-se para mostrar/esconder um campo de input na UI, por exemplo.
   */
  waitingForInput$ = new Subject<boolean>();
  private _waitingForInput$?: Subscription;

  /**
   * Flag que indica se há um programa em execução no momento.
   */
  running = false;

  /**
   * Um stream (canal) que emite `true` quando a execução começa e `false` quando ela termina.
   * Inscreva-se para desabilitar/habilitar botões como "Executar" ou "Parar" na UI.
   */
  running$ = new Subject<boolean>();
  private _running$?: Subscription;

  /**
   * Um stream (canal) que emite eventos importantes do ciclo de vida da execução,
   * como 'finish', 'clear', e 'error'.
   */
  events = new Subject<PortugolEvent>();

  /**
   * Instância do listener de erros do ANTLR para coletar erros de sintaxe.
   * @internal
   */
  errorListener = new PortugolErrorListener();

  /**
   * Ponto de entrada principal para executar um código.
   * Este método orquestra o pipeline completo:
   * 1. Limpa o estado de execuções anteriores.
   * 2. Verifica a sintaxe do código em busca de erros.
   * 3. Transpila o código Portugol para JavaScript.
   * 4. Inicia a execução do código transpilado através do runner injetado.
   *
   * @param code O código fonte em Portugol a ser executado.
   */
  run(code: string) {
    let errors: PortugolCodeError[] = [];
    let parseErrors: PortugolCodeError[] = [];
    let js = "";
    let checkStart = 0;
    let checkEnd = 0;
    let transpileStart = 0;
    let transpileEnd = 0;

    try {
      checkStart = performance.now();
      const checkResult = PortugolErrorChecker.checkCode(code);

      errors = checkResult.errors;
      parseErrors = checkResult.parseErrors;

      checkEnd = performance.now();

      transpileStart = performance.now();
      js = new PortugolJs().visit(checkResult.tree)!;
      transpileEnd = performance.now();
    } catch {}

    this.runTranspiled({
      code,
      js,
      errors,
      parseErrors,
      times: {
        check: checkEnd - checkStart,
        transpile: transpileEnd - transpileStart,
      },
    });
  }

  #printTimes(_times: { check: number; transpile: number; execution?: number }) {}

  /**
   * Executa um código já transpilado.
   * @internal
   */
  runTranspiled({
    code,
    js,
    errors,
    parseErrors,
    times,
  }: {
    code: string;
    js: string;
    errors: PortugolCodeError[];
    parseErrors: PortugolCodeError[];
    times: { check: number; transpile: number };
  }) {
    try {
      this.reset();

      if (parseErrors.length > 0) {
        throw new Error("Parse errors");
      }

      if (errors.length > 0) {
        const argueAboutAlgolIfNeeded = () => {
          if (
            ["fimalgoritmo", "fimenquanto", "fimpara", "fimse", "fimfuncao"].some(keyword => code.includes(keyword))
          ) {
            this.stdOut += `\n`;
            this.stdOut += `╔═════════════════════════════════════╗\n`;
            this.stdOut += `║               ATENÇÃO               ║\n`;
            this.stdOut += `║                                     ║\n`;
            this.stdOut += `║ Foi detectado que o seu código está ║\n`;
            this.stdOut += `║ usando o Portugol no formato Algol. ║\n`;
            this.stdOut += `║ O Portugol Webstudio dá suporte ao  ║\n`;
            this.stdOut += `║ Portugol no formato definido pela   ║\n`;
            this.stdOut += `║ UNIVALI. Por favor, leia mais sobre ║\n`;
            this.stdOut += `║ na seção Ajuda.                     ║\n`;
            this.stdOut += `╚═════════════════════════════════════╝\n\n`;
          }
        };

        argueAboutAlgolIfNeeded();

        this.stdOut += `⛔ O seu código possui ${errors.length} erro${errors.length > 1 ? "s" : ""} de compilação:\n`;
        this.stdOut += errors
          .map(error => `   - ${error.message} (linha ${error.startLine}, posição ${error.startCol})\n`)
          .join("");

        this.stdOut +=
          "\n⚠️ Estamos aprimorando a detecção de erros. Seu código será executado mesmo com erros, mas se não forem corrigidos, a execução pode exibir mensagens de erro em inglês ou sem explicação.\n";

        argueAboutAlgolIfNeeded();

        this.stdOut += "- O seu programa irá iniciar abaixo -\n";
        this.stdOut$.next(this.stdOut);
      }

      // @ts-expect-error
      this._runner = new this.runner(js);

      if (!this._runner) {
        throw new Error("Runner not found");
      }

      this.byteCode = this._runner.byteCode;

      this._runner.stdOut$.subscribe(data => {
        this.stdOut += data;
        this.stdOut$.next(data);
      });

      this._runner.waitingForInput$.subscribe(data => {
        this.waitingForInput = data;
        this.waitingForInput$.next(data);
      });

      this._runner.running$.subscribe(data => {
        this.running = data;
        this.running$.next(data);
      });

      this._runner.run().subscribe({
        next: event => {
          switch (event.type) {
            case "finish": {
              if (event.stopped) {
                this.stdOut += `\nO programa foi interrompido! Tempo de execução: ${event.time} milissegundos\n`;
              } else {
                this.stdOut += `\nPrograma finalizado. Tempo de execução: ${event.time} milissegundos\n`;
              }

              this.#printTimes({ ...times, execution: event.time });
              this.stdOut$.next(this.stdOut);
              break;
            }

            case "clear": {
              this.stdOut = "";
              this.stdOut$.next(this.stdOut);
              break;
            }

            case "error": {
              this.stdOut += `\n⛔ ${event.error.message}\n`;
              this.stdOut$.next(this.stdOut);
              break;
            }

            default: {
              break;
            }
          }

          this.events.next(event);
        },

        error(error) {
          console.error(error);
        },
      });
    } catch (error) {
      console.error(error);

      this.stdOut += `\n⛔ O seu código possui um erro de compilação!\n`;
      this.stdOut$.next(this.stdOut);
      this.#printTimes(times);

      this.reset(false);
      this.events.next({ type: "parseError", errors: parseErrors });
    }
  }

  /**
   * Interrompe forçadamente a execução do programa em andamento.
   * Essencial para lidar com loops infinitos ou para permitir que o usuário pare o código.
   */
  stop() {
    this.reset(false);
  }

  /**
   * Reseta o estado do executor para um estado limpo.
   * Para qualquer execução em andamento, cancela as inscrições internas e, opcionalmente,
   * limpa o console de saída.
   *
   * @param clearStdOut Se `true`, o console de saída (`stdOut`) será limpo.
   * O padrão é `true`.
   */
  private reset(clearStdOut = true) {
    if (clearStdOut) {
      this.stdOut = "";
    }

    this._stdOut$?.unsubscribe();

    this.waitingForInput = false;
    this._waitingForInput$?.unsubscribe();

    this.running = false;
    this._running$?.unsubscribe();

    this._runner?.destroy(true);
  }

  /**
   * Envia uma mensagem para o runner.
   * @internal
   */
  postMessage(message: PortugolMessage) {
    this._runner?.postMessage(message);
  }

  /**
   * Responde a uma mensagem recebida do runner.
   * @internal
   */
  replyMessage(message: PortugolMessage, result: unknown, transferable?: Transferable[]) {
    this._runner?.replyMessage(message, result, transferable);
  }
}
