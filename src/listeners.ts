// Listen for new or removed data contexts

export let newContextListeners: Array<() => void> = [];

export function addNewContextListener(listener: () => void): void {
  newContextListeners.push(listener);
}

export function removeNewContextListener(listener: () => void): void {
  newContextListeners = newContextListeners.filter((v) => v !== listener);
}

export function callAllContextListeners(): void {
  for (const f of newContextListeners) {
    f();
  }
}

// Listen for data context updates

/**
 * This maps context names to a list of [dependencies, listener] pairs.
 * The dependencies indicate which other entities are required to be valid
 * for the listener to be successfully called.
 */
export const contextUpdateListeners: Record<
  string,
  Array<[string[], () => void]>
> = {};

export function addContextUpdateListener(
  context: string,
  dependencies: string[],
  listener: () => void
): void {
  if (contextUpdateListeners[context] === undefined) {
    contextUpdateListeners[context] = [];
  }
  contextUpdateListeners[context].push([dependencies, listener]);
}

export function removeContextUpdateListener(
  context: string,
  listener: () => void
): void {
  if (contextUpdateListeners[context] !== undefined) {
    contextUpdateListeners[context] = contextUpdateListeners[context].filter(
      ([, f]) => f !== listener
    );
  }
}

export function removeContextUpdateListenersForContext(context: string): void {
  delete contextUpdateListeners[context];
}

export function removeListenersWithDependency(dep: string): void {
  for (const [context, values] of Object.entries(contextUpdateListeners)) {
    const keep: [string[], () => void][] = [];
    for (const [dependencies, listener] of values) {
      if (!dependencies.includes(dep)) {
        keep.push([dependencies, listener]);
      }
    }
    contextUpdateListeners[context] = keep;
  }
}

export async function callUpdateListenersForContext(
  context: string
): Promise<void> {
  if (contextUpdateListeners[context] !== undefined) {
    for (const [, f] of contextUpdateListeners[context]) {
      await f();
    }
  }
}
