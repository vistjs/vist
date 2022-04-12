import { APPFLAG } from '../constant';

export function logError(e: Error | string): string {
    const msg = (e as Error).message || (e as string)
    console.error(`${APPFLAG} Error: ${msg}`)
    return msg
}

export function logWarn(e: Error | string): string {
    const msg = (e as Error).message || (e as string)
    console.warn(`${APPFLAG} Warning: ${msg}`)
    return msg
}

export function throttle(func: Function, wait: number, options: { leading?: boolean; trailing?: boolean } = {}): any {
    let context: any
    let args: any
    let result: any
    let timeout: any = null
    let previous = 0

    const later = function () {
        previous = options.leading === false ? 0 : Date.now()
        timeout = null
        result = func.apply(context, args)
        if (!timeout) context = args = null
    }
    return function (this: any) {
        const now = Date.now()
        if (!previous && options.leading === false) previous = now
        const remaining = wait - (now - previous)
        context = this
        args = arguments
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            previous = now
            result = func.apply(context, args)
            if (!timeout) context = args = null
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining)
        }
        return result
    }
}

type Procedure = (...args: any[]) => void

type Options = {
    isImmediate?: boolean

    // not standard
    isTrailing?: boolean
}

export function debounce<F extends Procedure>(
    func: F,
    waitMilliseconds: number,
    options: Options = {
        isImmediate: false,
        isTrailing: false
    }
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
        const context = this

        const doLater = function () {
            timeoutId = undefined
            if (!options.isImmediate || options.isTrailing) {
                func.apply(context, args)
            }
        }

        const shouldCallNow = options.isImmediate && timeoutId === undefined

        if (timeoutId !== undefined) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(doLater, waitMilliseconds)

        if (shouldCallNow) {
            func.apply(context, args)
        }
    }
}

export function getTime(): number {
    return Date.now()
}

export const tempEmptyFn = () => {}
export const tempEmptyPromise = () => Promise.resolve()

export async function delay(t = 200): Promise<void> {
    return new Promise(r => {
        setTimeout(() => r(), t)
    })
}