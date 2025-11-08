export interface GraphOptions {
  path?: string;
}

export type Key = string | number | symbol;
export type Node<T = Key> = {
  value: T;
  edges: Key[];
};

export type Cycle = Key[];

export interface DuplicateKey<T = Key> {
  key: Key;
  values: T[];
}

export interface SortResult<T = Key> {
  nodes: Node<T>[][];
  cycles: Cycle[];
  duplicates: DuplicateKey<T>[];
}

export const SortMode = {
  Group: 1,
  Flat: 2,
} as const;
export type SortModeEnum = (typeof SortMode)[keyof typeof SortMode];
