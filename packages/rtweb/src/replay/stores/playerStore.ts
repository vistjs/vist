
import { makeObservable, observable, action } from "mobx"
import { ReplayOptions } from '../../types'
import { RootStore } from '.'
 const initState = {
     speed: 0,
     options: {} as ReplayOptions
 }

export type PlayerState = typeof initState

export default class PlayerStore {
    rootStore
    speed = initState.speed;
    options = initState.options;


    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeObservable(this, {
            speed: observable,
            options: observable,
            setOptions: action,
            setSpeed: action,
            reset: action,
        })
    }

    setOptions(options: ReplayOptions) {
        this.options = options;
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    reset() {
        Object.assign(this, initState)
    }

}