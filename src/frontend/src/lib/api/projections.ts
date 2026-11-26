import type {
  TicketInternal,
  TicketPublic as DraftTicketPublic,
  TicketViewPage,
} from "./contract.generated";

export type { TicketInternal };

/** Keep the public projection distinct in TypeScript's structural type system. */
export type TicketPublic = DraftTicketPublic & {
  [Field in Exclude<keyof TicketInternal, keyof DraftTicketPublic>]?: never;
};

export type TicketPage<T extends TicketPublic | TicketInternal> = Omit<
  TicketViewPage,
  "items"
> & { items: T[] };
