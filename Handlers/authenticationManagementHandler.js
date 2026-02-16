/**
 * **************************************************************************************************
 * **************************************************************************************************
 * The authenticationManagement entity provides methods to manage authentication flows, executions,
 * and related settings within a Keycloak realm. These operations let you:
 *    - Create and manage authentication flows (e.g., browser flow, direct grant flow).
 *    - Add and configure executions (authenticators, forms, conditions).
 *    - Update execution requirements (e.g., REQUIRED, ALTERNATIVE, DISABLED).
 *    - Handle form providers and authenticator configuration.
 *    - Manage bindings (set a realm’s browser flow, direct grant flow, etc.).
 *
 * Common Use Cases:
 *    - Defining custom login flows.
 *    - Adding 2FA authenticators (e.g., OTP, WebAuthn) to flows.
 *    - Configuring conditional executions (e.g., "only if user has role X").
 *    - Assigning authentication flows to realm bindings (browser, reset credentials, etc.).
 * **************************************************************************************************
 * **************************************************************************************************
 */
let kcAdminClientHandler=null;
exports.setKcAdminClient=function(kcAdminClient){
 kcAdminClientHandler=kcAdminClient;
}


/**
 * ***************************** - deleteRequiredAction - *******************************
 * The method deletes a required action from a Keycloak realm.
 * Required actions are tasks that users must complete after login, such as:
 *     - Updating their password
 *     - Verifying their email
 *     - Configuring OTP
 *     - Accepting terms and conditions
 *
 * By deleting a required action, it will no longer be available for assignment to users.
 *
 *  @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The unique alias of the required action to delete (e.g., "UPDATE_PASSWORD").
 */
exports.deleteRequiredAction=function(filter){
 return (kcAdminClientHandler.authenticationManagement.deleteRequiredAction(filter));
}



/**
 * ***************************** - registerRequiredAction - *******************************
 * The method registers a new required action in a Keycloak realm.
 * Required actions are tasks that users may be forced to perform during authentication (e.g., verify email, update password, configure OTP, or a custom scripted action).
 * This method is typically used after checking available actions via getUnregisteredRequiredActions.
 *
 *  @parameters:
 * - actionRepresentation: The representation of the required action to register.
 *    - providerId: [required] Unique ID of the required action (e.g., "terms_and_conditions").
 *    - name: [required] Display name of the required action.
 *    - description : [optional] Human-readable description of the action.
 *    - defaultAction: [optional] Whether the action should be enabled by default.
 *    - enabled: [optional] Whether the action is active.
 *    - priority: [optional] Determines the execution order among required actions.
 *    - config: [optional] Extra configuration options (usually empty for built-in actions).
 */
exports.registerRequiredAction=function(actionRepresentation){
 return (kcAdminClientHandler.authenticationManagement.registerRequiredAction(actionRepresentation));
}


/**
 * ***************************** - getUnregisteredRequiredActions - *******************************
 * The method retrieves all available required actions that exist in Keycloak but are not
 * yet registered in a given realm. This is useful if you want to see which built-in or custom
 * required actions can still be added to the realm (e.g., custom scripts, OTP setup, email verification).
 */
exports.getUnregisteredRequiredActions=function(){
 return (kcAdminClientHandler.authenticationManagement.getUnregisteredRequiredActions());
}


/**
 * ***************************** - getRequiredActions - *******************************
 * The method retrieves all required actions that are currently registered and available in a given Keycloak realm.
 * Required actions are tasks that users may be required to perform during authentication, such as:
 *     - Updating password
 *     - Verifying email
 *     - Configuring OTP
 *     - Accepting terms and conditions
 *     - {other fields}
 */
exports.getRequiredActions=function(){
 return (kcAdminClientHandler.authenticationManagement.getRequiredActions());
}



/**
 * ***************************** - getRequiredActionForAlias - *******************************
 * The method retrieves a single required action in a Keycloak realm by its alias.
 * Required actions are tasks that users may be forced to complete during authentication,
 * such as update password, verify email, or configure OTP.
 * This method is useful when you want details about a specific required action without listing all actions.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The unique alias of the required action to retrieve (e.g., "UPDATE_PASSWORD").
 */
exports.getRequiredActionForAlias=function(filter){
 return (kcAdminClientHandler.authenticationManagement.getRequiredActionForAlias(filter));
}


/**
 * ***************************** - lowerRequiredActionPriority - *******************************
 * The method lowers the priority of a registered required action in a Keycloak realm.
 * Priority determines the order in which required actions are executed for a user during authentication. Lowering the priority moves the action further down the execution order.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias (providerId) of the required action to modify.
 */
exports.lowerRequiredActionPriority=function(filter){
 return (kcAdminClientHandler.authenticationManagement.lowerRequiredActionPriority(filter));
}


/**
 * ***************************** - raiseRequiredActionPriority - *******************************
 * The method raises the priority of a registered required action in a Keycloak realm.
 * Priority determines the order in which required actions are executed for a user during authentication.
 * Raising the priority moves the action higher in the execution order, meaning it will be executed sooner.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias (providerId) of the required action to modify.
 */
exports.raiseRequiredActionPriority=function(filter){
 return (kcAdminClientHandler.authenticationManagement.raiseRequiredActionPriority(filter));
}


/**
 * ***************************** - getRequiredActionConfigDescription - *******************************
 * The method retrieves the configuration description for a specific required action in a Keycloak realm.
 * This includes details about the configurable options available for that required action, such as which fields can be set, their types, and any default values.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias (providerId) of the required action.
 */
exports.getRequiredActionConfigDescription=function(filter){
 return (kcAdminClientHandler.authenticationManagement.getRequiredActionConfigDescription(filter));
}


/**
 * ***************************** - getRequiredActionConfig - *******************************
 * The method retrieves the current configuration for a specific required action in a Keycloak realm.
 * This allows you to see the settings that have been applied to a required action, such as OTP policies, password requirements, or any custom configurations.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias (providerId) of the required action.
 */
exports.getRequiredActionConfig=function(filter){
 return (kcAdminClientHandler.authenticationManagement.getRequiredActionConfig(filter));
}



/**
 * ***************************** - removeRequiredActionConfig - *******************************
 * The method deletes the configuration of a specific required action in a Keycloak realm.
 * This removes any customized settings for the action, effectively resetting it to its default behavior.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias (providerId) of the required action.
 */
exports.removeRequiredActionConfig=function(filter){
 return (kcAdminClientHandler.authenticationManagement.removeRequiredActionConfig(filter));
}



/**
 * ***************************** - updateRequiredAction - *******************************
 * The method updates an existing required action in a Keycloak realm.
 * Required actions are tasks that users may be required to perform during authentication, such as:
 *  - Updating password
 * - Verifying email
 * - Configuring OTP
 * - Accepting terms and conditions
 *
 *
 * This method allows you to modify attributes such as enabled, defaultAction, priority, or configuration of a required action.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias (providerId) of the required action to update.
 * - actionRepresentation: The updated representation of the required action.
 *     - providerId: [required] Unique ID of the required action (alias).
 *     - name: [required] Display name of the action.
 *     - description: [optional] Human-readable description.
 *     - enabled: [optional] Whether the action is active.
 *     - defaultAction: [optional] Whether the action is assigned to new users by default.
 *     - priority: [optional] Execution order among required actions.
 *     - config: [optional] Extra configuration.
 */
exports.updateRequiredAction=function(filter,actionRepresentation){
 return (kcAdminClientHandler.authenticationManagement.updateRequiredAction(filter,actionRepresentation));
}


/**
 * ***************************** - updateRequiredActionConfig - *******************************
 * The method updates the configuration of a specific required action in a Keycloak realm.
 * This allows you to modify settings such as OTP policies, password requirements, or other parameters of built-in or custom required actions.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - alias: [required] The alias (providerId) of the required action to update.
 * - actionConfigRepresentation: The configuration object to update.
 */
exports.updateRequiredActionConfig=function(filter, actionConfigRepresentation){
 return (kcAdminClientHandler.authenticationManagement.updateRequiredActionConfig(filter,actionConfigRepresentation));
}


/**
 * ***************************** - getClientAuthenticatorProviders - *******************************
 * The method retrieves all client authenticator providers available in a Keycloak realm.
 * Client authenticators are used to verify clients during authentication, such as:
 *    - Client ID and secret authentication
 *    - JWT or X.509 certificate authentication
 *    - Custom client authenticators
 *
 * This method is useful for configuring client authentication flows and assigning authenticators to specific clients.
 */
exports.getClientAuthenticatorProviders=function(){
 return (kcAdminClientHandler.authenticationManagement.getClientAuthenticatorProviders());
}



/**
 * ***************************** - getFormActionProviders - *******************************
 * The method retrieves all form action providers available in a Keycloak realm.
 * Form action providers are used during authentication flows to perform specific actions in forms, such as:
 *     - OTP validation
 *     - Password update
 *     - Terms and conditions acceptance
 *     - Custom scripted form actions
 *
 * This method is useful for configuring authentication flows that require specific user interactions.
 */
exports.getFormActionProviders=function(){
 return (kcAdminClientHandler.authenticationManagement.getFormActionProviders());
}



/**
 * ***************************** - getAuthenticatorProviders - *******************************
 * The method retrieves all authenticator providers available in a Keycloak realm.
 * Authenticators are used in authentication flows to verify users or perform specific steps during login, such as:
 *     - Username/password verification
 *     - OTP verification
 *     - WebAuthn authentication
 *     - Custom authenticators
 *
 * This method is useful for configuring authentication flows and adding or replacing authenticators.
 */
exports.getAuthenticatorProviders=function(){
 return (kcAdminClientHandler.authenticationManagement.getAuthenticatorProviders());
}


/**
 * ***************************** - getFormProviders - *******************************
 * The method retrieves all form providers available in a Keycloak realm.
 * Form providers are used in authentication flows to render or handle user-facing forms, such as:
 *     - Login forms
 *     - Registration forms
 *     - OTP input forms
 *     - Terms and conditions acceptance
 *
 * This method is useful for configuring authentication flows that require user interaction through forms.
 */
exports.getFormProviders=function(){
 return (kcAdminClientHandler.authenticationManagement.getFormProviders());
}


/**
 * ***************************** - getFlows - *******************************
 * The method retrieves all authentication flows in a Keycloak realm.
 * Authentication flows define the sequence of authenticators and required
 * actions that users must complete during login or other authentication events.
 *
 * This method allows you to inspect existing flows, including built-in flows like browser,
 * direct grant, or registration, as well as custom flows.
 */
exports.getFlows=function(){
 return (kcAdminClientHandler.authenticationManagement.getFlows());
}



/**
 * ***************************** - createFlow - *******************************
 * The method retrieves a specific authentication flow in a Keycloak realm by its id.
 * Authentication flows define the sequence of authenticators and required actions that users must complete during login or other authentication events.
 * This method is useful for inspecting or modifying a particular flow.
 *
 * @parameters:
 * - flowRepresentation: The representation of the new flow. A typical AuthenticationFlowRepresentation includes:
 *     - alias : [required] Human-readable alias for the flow.
 *     - providerId: [required] Type of flow ("basic-flow", "client-flow", etc.).
 *     - description: [optional] Description of the flow.
 *     - topLevel: [optional] Whether this is a top-level flow (default: true).
 *     - builtIn: [optional] Whether this is a built-in flow (default: false).
 *     - authenticationExecutions: [optional] Executions to include in the flow.
 */
exports.createFlow=function(flowRepresentation){
 return (kcAdminClientHandler.authenticationManagement.createFlow(flowRepresentation));
}



/**
 * ***************************** - updateFlow - *******************************
 * The method updates an existing authentication flow in a Keycloak realm.
 * This allows you to modify attributes such as the flow’s description, alias, top-level status, or other properties.
 *
 * @parameters:
 * filter: Parameter provided as a JSON object that accepts the following filter:
 *     - flowId: [required] The id of the source flow to update.
 * - flowRepresentation: The representation of the flow to update. A typical AuthenticationFlowRepresentation includes:
 *     - alias : [required] Human-readable alias for the flow.
 *     - providerId: [required] Type of flow ("basic-flow", "client-flow", etc.).
 *     - description: [optional] Description of the flow.
 *     - topLevel: [optional] Whether this is a top-level flow (default: true).
 *     - builtIn: [optional] Whether this is a built-in flow (default: false).
 *     - authenticationExecutions: [optional] Executions to include in the flow.
 */
exports.updateFlow=function(filter, flowRepresentation){
 return (kcAdminClientHandler.authenticationManagement.updateFlow(filter, flowRepresentation));
}


/**
 * ***************************** - deleteFlow - *******************************
 * The method deletes an existing authentication flow in a Keycloak realm.
 * Deleting a flow removes it completely, including all its executions and subflows.
 * This is typically used to remove custom flows that are no longer needed.
 *
 * @parameters:
 * filter: Parameter provided as a JSON object that accepts the following filter:
 *     - flowId: [required] The id of the source flow to update.
 */
exports.deleteFlow=function(filter){
 return (kcAdminClientHandler.authenticationManagement.deleteFlow(filter));
}



/**
 * ***************************** - copyFlow - *******************************
 * The method duplicates an existing authentication flow in a Keycloak realm.
 * This is useful for creating a custom flow based on an existing built-in or custom flow, preserving all executions and subflows.
 *
 * @parameters:
 * - filter: Parameter provided as a JSON object that accepts the following filter:
 *     - flow: [required] The alias of the source flow to copy.
 *     - newName: [required] The alias of the new copied flow.
 */
exports.copyFlow=function(filter){
 return (kcAdminClientHandler.authenticationManagement.copyFlow(filter));
}


/**
 * ***************************** - getFlow - *******************************
 * The method retrieves a specific authentication flow in a Keycloak realm by its id.
 * Authentication flows define the sequence of authenticators and required actions that users must complete during login or other authentication events.
 * This method is useful for inspecting or modifying a particular flow.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - flowId: [required] The id of the authentication flow to retrieve
 */
exports.getFlow=function(filter){
 return (kcAdminClientHandler.authenticationManagement.getFlow(filter));
}


/**
 * ***************************** - getExecutions - *******************************
 * The method retrieves all authentication executions for a specific authentication flow in a Keycloak realm.
 * Executions define the individual steps or actions within a flow, such as:
 *     - Username/password verification
 *     - OTP validation
 *     - Terms acceptance
 *     - Subflows
 *
 * This method is useful to inspect or modify the steps of a flow.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - flow: [required] The alias of the authentication flow whose executions you want to retrieve.
 */
exports.getExecutions=function(filter){
 return (kcAdminClientHandler.authenticationManagement.getExecutions(filter));
}



/**
 * ***************************** - addExecutionToFlow - *******************************
 * The method adds a new execution (step) to an existing authentication flow in a Keycloak realm.
 * Executions define the individual actions or authenticators in a flow, such as username/password verification, OTP validation, or custom authenticators.
 * This method allows you to extend a flow with additional steps or subflows.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - flow: [required] The alias of the authentication flow to which the execution will be added.
 *     - provider: [required] The authenticator or subflow to add (e.g., "auth-otp-form").
 *     - requirement: [optional] "REQUIRED" | "ALTERNATIVE" | "DISABLED"
 *     - priority: [optional] Number representing the execution order
 *     - authenticatorFlow: [optional] Boolean indicating if the execution is a nested flow
 */
exports.addExecutionToFlow=function(filter){
 return (kcAdminClientHandler.authenticationManagement.addExecutionToFlow(filter));
}



/**
 * ***************************** - addFlowToFlow - *******************************
 * The method adds an existing authentication flow as a subflow to another authentication flow in a Keycloak realm.
 * This allows you to nest flows, creating complex authentication sequences where one flow can call another as a step.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - flow: [required] The alias of the parent authentication flow.
 *     - alias: [required] The alias (name) of the new subflow.
 *     - type: [required] Type of the flow (e.g., "basic-flow", "client-flow").
 *     - provider: [required] The provider ID of the flow (e.g., "registration-page-form").
 *     - description: [optional] A human-readable description of the subflow.
 */
exports.addFlowToFlow=function(filter){
 return (kcAdminClientHandler.authenticationManagement.addFlowToFlow(filter));
}



/**
 * ***************************** - updateExecution - *******************************
 * The method updates an existing execution (step) within an authentication flow in a Keycloak realm.
 * Executions are individual authenticators or subflows within a flow, and this method allows you to modify their requirement, priority, or other settings.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - flow: [required] The alias of the authentication flow containing the execution.
 * - executionRepresentation: The updated execution object. Typical fields in AuthenticationExecutionInfoRepresentation:
 *     - id: [required] The ID of the execution.
 *     - requirement: [optional] "REQUIRED" | "ALTERNATIVE" | "DISABLED"
 *     - priority: [optional] Execution order within the flow
 *     - authenticator: [optional] Authenticator ID (if changing the execution type)
 *     - authenticatorFlow: [optional] Whether the execution is a nested flow
 */
exports.updateExecution=function(filter, executionRepresentation){
 return (kcAdminClientHandler.authenticationManagement.updateExecution(filter,executionRepresentation));
}



/**
 * ***************************** - delExecution - *******************************
 * The method deletes an existing execution (step) from an authentication flow in a Keycloak realm.
 * Executions are individual authenticators or subflows within a flow, and this method removes them completely from the flow.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the execution to delete.
 */
exports.delExecution=function(filter){
 return (kcAdminClientHandler.authenticationManagement.delExecution(filter));
}


/**
 * ***************************** - raisePriorityExecution - *******************************
 * The method increases the priority of an execution within an authentication flow in a Keycloak realm.
 * Increasing the priority moves the execution earlier in the flow sequence, affecting the order
 * in which authenticators or subflows are executed.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] he ID of the execution whose priority will be raised.
 */
exports.raisePriorityExecution=function(filter){
 return (kcAdminClientHandler.authenticationManagement.raisePriorityExecution(filter));
}


/**
 * ***************************** - lowerPriorityExecution - *******************************
 * The method decreases the priority of an execution within an authentication flow in a Keycloak realm.
 * Lowering the priority moves the execution later in the flow sequence, affecting the order in which authenticators or subflows are executed.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] he ID of the execution whose priority will be lowered.
 */
exports.lowerPriorityExecution=function(filter){
 return (kcAdminClientHandler.authenticationManagement.lowerPriorityExecution(filter));
}



/**
 * ***************************** - createConfig - *******************************
 * The method creates a configuration for a specific execution (step) within an authentication flow in a Keycloak realm.
 * Configurations allow you to customize the behavior of an authenticator or required action,
 * such as OTP policies, password requirements, or custom parameters.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the execution or required action to configure.
 *     - alias: [required] The alias (name) of the configuration.
 *     - config: [optional] The payload can also include a config object with key-value pairs for configuration parameters.
 */
exports.createConfig=function(filter){
 return (kcAdminClientHandler.authenticationManagement.createConfig(filter));
}


/**
 * ***************************** - getConfig - *******************************
 * The method retrieves the configuration of a specific required action or execution within an authentication flow in a Keycloak realm.
 * Configurations define additional settings for authenticators or required actions, such as OTP policies, password rules, or custom parameters.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the execution or required action whose configuration you want to retrieve.
 */
exports.getConfig=function(filter){
 return (kcAdminClientHandler.authenticationManagement.getConfig(filter));
}


/**
 * ***************************** - updateConfig - *******************************
 * The method updates the configuration of a specific required action or execution within an authentication
 * flow in a Keycloak realm. This allows you to modify existing settings, such as OTP policies,
 * password rules, or any custom parameters, without creating a new configuration.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the existing configuration.
 *     - config: [required] Key-value pairs representing the new configuration parameters.
 */
exports.updateConfig=function(filter){
 return (kcAdminClientHandler.authenticationManagement.updateConfig(filter));
}





/**
 * ***************************** - delConfig - *******************************
 * The method deletes a configuration associated with a specific required action or execution within an authentication flow in a Keycloak realm.
 * This is useful for removing obsolete or unwanted settings from a required action or execution.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - id: [required] The ID of the existing configuration.
 */
exports.delConfig=function(filter){
 return (kcAdminClientHandler.authenticationManagement.delConfig(filter));
}


/**
 * ***************************** - getConfigDescription - *******************************
 * The method retrieves the configuration description for a specific authenticator or required action in a Keycloak realm.
 * This provides metadata and guidance about the configuration options available for the authenticator, such as:
 *     - Names of configuration properties
 *     - Types (string, boolean, list, etc.)
 *     - Default values
 *     - Help texts or descriptions
 *
 * This is useful for dynamically generating forms for configuring required actions or authenticators.
 *
 * @parameters:
 * - filter: parameter provided as a JSON object that accepts the following filter:
 *     - providerId: [required] The ID of the authenticator or required action whose configuration description you want to retrieve.
 */
exports.getConfigDescription=function(filter){
 return (kcAdminClientHandler.authenticationManagement.getConfigDescription(filter));
}