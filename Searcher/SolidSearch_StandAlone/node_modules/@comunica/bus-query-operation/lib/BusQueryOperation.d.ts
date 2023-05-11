import type { IActorTest, IBusArgs } from '@comunica/core';
import { BusIndexed } from '@comunica/core';
import type { IQueryOperationResult } from '@comunica/types';
import type { ActorQueryOperation, IActionQueryOperation } from './ActorQueryOperation';
/**
 * Indexed bus for query operations.
 */
export declare class BusQueryOperation extends BusIndexed<ActorQueryOperation, IActionQueryOperation, IActorTest, IQueryOperationResult> {
    constructor(args: IBusArgs);
}
