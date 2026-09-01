type BibleLocalChangeListener = () => void;

const listeners = new Set<BibleLocalChangeListener>();

export function notifyBibleLocalChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeToBibleLocalChanges(listener: BibleLocalChangeListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
