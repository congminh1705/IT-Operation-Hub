import type {
  TicketInternal,
  TicketPublic as DraftTicketPublic,
  TicketListPage,
} from "./contract.generated";

export type { TicketInternal };

/** Keep the public projection distinct in TypeScript's structural type system. */
export type TicketPublic = DraftTicketPublic & {
  [Field in Exclude<keyof TicketInternal, keyof DraftTicketPublic>]?: never;
};

export type TicketPage<T extends TicketPublic | TicketInternal> = Omit<
  TicketListPage,
  "items"
> & { items: T[] };
