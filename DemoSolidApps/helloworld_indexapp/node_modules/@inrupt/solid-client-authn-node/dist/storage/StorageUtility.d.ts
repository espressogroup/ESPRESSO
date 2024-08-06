/**
 * @hidden
 * @packageDocumentation
 */
/**
 * A helper class that will validate items taken from local storage
 */
import type { IStorage } from "@inrupt/solid-client-authn-core";
import { StorageUtility } from "@inrupt/solid-client-authn-core";
/**
 * This class in a no-value-added extension of StorageUtility from the core module.
 * The reason it has to be declared is for TSyringe to find the decorators in the
 * same modules as where the dependency container is declared (in this case,
 * the browser module, with the dependancy container in dependencies.ts).
 * @hidden
 */
export default class StorageUtilityNode extends StorageUtility {
    constructor(secureStorage: IStorage, insecureStorage: IStorage);
}
