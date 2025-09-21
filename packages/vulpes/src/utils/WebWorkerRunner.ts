import { PortugolWebWorkersRunner } from "@portugol-webstudio/runner";

export class CustomWebWorkersRunner extends PortugolWebWorkersRunner {
  protected getWorkerUrl(): URL {
    return new URL("/worker.js", window.location.origin);
  }
}
