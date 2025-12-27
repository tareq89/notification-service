export interface ICommandHandler<T = any> {
    handle(command: T): Promise<void>;
}
//# sourceMappingURL=ICommandHandler.d.ts.map