export interface GraphOptions {
  path?: string;
}

export type Key = string | number | symbol;

// Standard dependency graph format - minimal and intuitive
export interface DependencyGraph<T> {
  nodes: Record<string, T>; // Map of id -> item
  dependencies: Record<string, string[]>; // Map of id -> ids it depends on
}
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
