import { ActorAbstractPath } from '@comunica/actor-abstract-path';
import type { IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import type { IActionContext, IQueryOperationResult } from '@comunica/types';
import { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Path Inv Query Operation Actor.
 */
export declare class ActorQueryOperationPathInv extends ActorAbstractPath {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    runOperation(operation: Algebra.Path, context: IActionContext): Promise<IQueryOperationResult>;
}
