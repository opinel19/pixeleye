export type ProviderErrorKind = "auth" | "rate_limit" | "network" | "unknown";

export class ProviderError extends Error {
  kind: ProviderErrorKind;
  status?: number;
  provider?: string;

  constructor(
    message: string,
    kind: ProviderErrorKind,
    options?: { status?: number; provider?: string },
  ) {
    super(message);
    this.name = "ProviderError";
    this.kind = kind;
    this.status = options?.status;
    this.provider = options?.provider;
  }
}
