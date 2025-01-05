import { PortugolCodeError } from "@portugol-webstudio/antlr";
import { Observable, Subject } from "rxjs";

export type PortugolEvent =
  | { type: "start" }
  | { type: "clear" }
  | { type: "stdIn" }
  | { type: "error"; error: Error }
  | { type: "parseError"; errors: PortugolCodeError[] }
  | { type: "finish"; time: number }
  | { type: "graphics"; func: string; args: unknown[] };

export type PortugolMessage = { type: string; content?: string };

export abstract class IPortugolRunner {
  constructor(public byteCode: string) {}

  abstract stdIn: Subject<string>;
  abstract stdOut$: Observable<string>;

  abstract waitingForInput: boolean;
  abstract waitingForInput$: Observable<boolean>;

  abstract running: boolean;
  abstract running$: Observable<boolean>;

  abstract run(): Observable<PortugolEvent>;
  abstract destroy(): void;

  abstract postMessage(message: PortugolMessage): void;
}
