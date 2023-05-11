import { ActorAbstractPath } from '@comunica/actor-abstract-path';
import type { IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import type { IActionContext, IQueryOperationResult } from '@comunica/types';
import { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Path Link Query Operation Actor.
 */
export declare class ActorQueryOperationPathLink extends ActorAbstractPath {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    runOperation(operationOriginal: Algebra.Path, context: IActionContext): Promise<IQueryOperationResult>;
}
