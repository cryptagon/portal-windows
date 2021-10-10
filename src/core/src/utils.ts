export function deepCompareIntersection<T extends Record<string, any>>(obj1: T, obj2: T): boolean {
  return (
    obj1 === obj2 ||
    (typeof obj1 === typeof obj2 &&
      typeof obj1 === 'object' &&
      Object.keys(obj1).every(
        (key) => !obj2.hasOwnProperty(key) || deepCompareIntersection(obj1[key], obj2[key])
      ))
  )
}

export interface GenericLogger {
  info(...args: any): void
  error(...args: any): void
  debug(...args: any): void
}

export function loggerWithPrefix(prefix: string): GenericLogger {
  return {
    info: (...args: any) => console.log(prefix, ...args),
    error: (...args: any) => console.error(prefix, ...args),
    debug: (...args: any) => console.debug(prefix, ...args),
  }
}

export enum DebounceStyle {
  RESET_ON_NEW, // reset wait timer if new events come in
  IMMEDIATE_THEN_WAIT, // invoke function immediately, don't run again until timeout expires
  IGNORE_NEW, // wait, ignoring new requests
  QUEUE_LAST, // invoke function immediately, don't run again until timeout expires, but queue last function and run if it was called
}

export const createScopedDebounce = () => {
  const debounceTimers: { [id: string]: any } = {}

  const debounce = (id: string, func: () => void, wait: number, style: DebounceStyle) => {
    let timer = debounceTimers[id]

    switch (style) {
      case DebounceStyle.IMMEDIATE_THEN_WAIT:
        if (timer) return
        debounceTimers[id] = setTimeout(() => delete debounceTimers[id], wait)
        func()
        return

      case DebounceStyle.QUEUE_LAST:
        if (timer) {
          timer.queued = func
          timer.wait = wait
          return
        }
        debounceTimers[id] = {
          timer: setTimeout(() => {
            const queued = debounceTimers[id]
            delete debounceTimers[id]
            if (queued.queued) debounce(id, queued.queued, queued.wait, style)
          }, wait),
        }
        func()
        return

      case DebounceStyle.IGNORE_NEW:
        if (timer) return
        debounceTimers[id] = setTimeout(() => {
          func()
          delete debounceTimers[id]
        }, wait)
        return

      case DebounceStyle.RESET_ON_NEW:
      default:
        clearTimeout(timer)
        debounceTimers[id] = setTimeout(() => {
          func()
          delete debounceTimers[id]
        }, wait)
        return
    }
  }

  const clearDebounce = (id: string) => {
    let timer = debounceTimers[id]

    if (typeof timer == 'object') {
      clearTimeout(timer.timer)
    } else {
      clearTimeout(timer)
    }

    delete debounceTimers[id]
    return timer
  }

  const clearAllDebounces = () => {
    const debounceIds = Object.keys(debounceTimers)
    debounceIds.forEach((id) => clearDebounce(id))
  }

  return { debounce, clearDebounce, clearAllDebounces }
}

const globalDebounce = createScopedDebounce()
export const debounce = globalDebounce.debounce
export const clearDebounce = globalDebounce.clearDebounce
