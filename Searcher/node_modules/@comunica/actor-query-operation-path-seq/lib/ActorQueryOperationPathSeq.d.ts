import { ActorAbstractPath } from '@comunica/actor-abstract-path';
import type { IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import type { MediatorRdfJoin } from '@comunica/bus-rdf-join';
import type { IActionContext, IQueryOperationResult } from '@comunica/types';
import { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Path Seq Query Operation Actor.
 */
export declare class ActorQueryOperationPathSeq extends ActorAbstractPath {
    readonly mediatorJoin: MediatorRdfJoin;
    constructor(args: IActorQueryOperationPathSeq);
    runOperation(operationOriginal: Algebra.Path, context: IActionContext): Promise<IQueryOperationResult>;
}
export interface IActorQueryOperationPathSeq extends IActorQueryOperationTypedMediatedArgs {
    /**
     * A mediator for joining Bindings streams
     */
    mediatorJoin: MediatorRdfJoin;
}
