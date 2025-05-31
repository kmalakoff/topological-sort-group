export interface GraphOptions {
  path?: string;
}

export const SortMode = {
  Group: 1,
  Flat: 2,
} as const;

export type Cycle<T extends Key> = Value<T> | Key;
export type Node<T extends Key> = Value<T> | Key;
export interface SortResult<T extends Key> {
  nodes: Node<T>[][];
  cycles: Cycle<T>[];
}

export type Key = string | number | symbol;
export type NestedValue<T> = Record<Key, T>;
export type Value<T extends Key> = T | NestedValue<T | NestedValue<T>>;

export type Counter<T extends Key, X> = Record<T, X>;
export type NodeRecord<T extends Key> = {
  value: Value<T>;
  edges: T[];
};

export type NodeRecords<T extends Key> = {
  [key in T]: NodeRecord<T>;
};
