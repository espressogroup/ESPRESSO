/** @hidden Used to instantiate a separate instance from input parameters */
export declare function internal_cloneResource<ResourceExt extends object>(resource: ResourceExt): ResourceExt;
export declare function internal_isAuthenticationFailureResponse(response: Response): response is Response & {
    status: 401 | 403;
};
