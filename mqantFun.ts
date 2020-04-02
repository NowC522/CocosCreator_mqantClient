export class mqantFun {
    fun: Function
    context: any
    constructor(fun: Function, context: any) {
        this.fun = fun
        this.context = context
    }
}