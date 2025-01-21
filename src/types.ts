export interface GraphOptions {
  key?: string;
}

export type Counter<T extends Key> = {
  [key in T]: number;
};

export enum SortMode {
  Group = 1,
  Flat = 2,
}

export interface SortResult<T extends Key> {
  nodes: Array<Array<NestedKey<T> | Key>>;
  cycles: Array<Array<NestedKey<T> | Key>>;
}

export type Key = string | number | symbol;

export type NestedKey<T extends Key> = {
  [key in T]: Key;
};

export type NodeRecord<T extends Key> = {
  value: NestedKey<T> | T;
  edges: Array<T>;
};

export type NodeRecords<T extends Key> = {
  [key in T]: NodeRecord<T>;
};
