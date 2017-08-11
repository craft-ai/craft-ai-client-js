interface Versionable {
  _version?: string
}

export namespace Feature {
  interface Feature<T> {
    type: T
    is_generated?: boolean
  }

  interface GeneratedFeature<T> extends Feature<T> {
    is_generated?: true
  }

  type Enum<T extends string> = [Feature<'enum'>, T]
  type Continuous = [Feature<'continuous'>, number]
  type Timezone = [Feature<'timezone'>, string]
  type DayOfMonth = [GeneratedFeature<'day_of_month'>, number]
  type DayOfWeek = [GeneratedFeature<'day_of_week'>, number]
  type MonthOfYear = [GeneratedFeature<'month_of_year'>, number]
  type TimeOfDay = [GeneratedFeature<'time_of_day'>, number]
  type Cyclic = DayOfMonth | DayOfWeek | MonthOfYear | TimeOfDay
  type Generated = DayOfMonth | DayOfWeek | MonthOfYear | TimeOfDay
  type Any = Cyclic | Enum<string> | Continuous | Timezone
}

export namespace DecisionRule {
  interface Default {
    property: string
    operator: string
    operand: any
  }

  export interface Continuous extends Default {
    operator: '<' | '>='
    operand: number
  }

  export interface Enum extends Default {
    operator: 'is'
    operand: string
  }

  export interface Cyclic extends Default {
    operator: '[in['
    operand: [number, number]
  }

  export type Any = Continuous | Enum | Cyclic
}

export interface Features {
  [key: string]: Feature.Any
}

export type Context<F extends Features> = {
  [K in keyof F]: F[K][1]
}

export interface ContextOperation<F extends Features> {
  timestamp: number
  context: Partial<Context<F>>
}

export interface Configuration<F extends Features> extends Versionable {
  context: {
    [K in keyof F]: F[K][0]
  }
  output: (keyof F)[]
  time_quantum?: number
  learning_period?: number
  operations_as_events?: boolean
  tree_max_operations?: number
  tree_max_depth?: number
}

export interface Agent<F extends Features> extends Versionable {
  id: string
  configuration: Configuration<F>
  firstTimestamp: number
  lastTimestamp: number
  creationDate: number
  lastTreeUpdate: number
  lastContextUpdate: number
}

export interface DecisionTree<F extends Features> extends Versionable {
  configuration: Configuration<F>
  timestamp?: number
  trees?: {
    [output: string]: DecisionTreeLeaf | DecisionTreeNode
  }
}

export interface DecisionTreeLeaf {
  predicted_value: string | number | null
  confidence: number
  standard_deviation: number
  decision_rule: DecisionRule.Any
}

export interface DecisionTreeNode {
  decision_rule: DecisionRule.Any
  children: (DecisionTreeLeaf | DecisionTreeNode)[]
}

export interface Decision<F extends Features> extends Versionable {
  context: Context<F>
  output: {
    [feature: string]: {
      predicted_value?: string | number
      confidence?: number
      standard_deviation?: number
      decision_rules: DecisionRule.Any[]
      error?: {
        name: 'CraftAiNullDecisionError' | 'CraftAiUnknownError'
        message: string
        metadata: { [key: string]: any }
      }
    }
  }
}

export interface Client {
  cfg: {
    token: string
    operationsChunksSize: number
  }

  /**
   * Adds context operations to the given agent id.
   *
   * First context operation must define every feature of the agent configuration.
   * @param agentId Id of the agent
   * @param contextOperations Array of context operations
   */
  addAgentContextOperations<F extends Features> (agentId: string, contextOperations: ContextOperation<F>[]): Promise<Agent<F>>

  /**
   * Computes the decision for a given context with the decision tree of the provided agent id.
   *
   * The partial context operations are merged from left to right to forge a single context.
   * The features of the right-most partial context operation overwrites the other.
   * `Time` instance is used to generate the time-related features and considered as a partial context operation.
   * @param agentId Id of the agent
   * @param treeTimestamp Timestamp of the tree used to compute the decision
   * @param timeOrContextOperation A list of partial context operation or an instance of `Time`
   */
  computeAgentDecision<F extends Features> (agentId: string, treeTimestamp: number, ...timeOrContextOperation: (Partial<Context<F>> | Time)[]): Decision<F>

  /**
   * Creates an agent in the current project.
   *
   * If the agent id is not provided, craft ai generates a random id.
   * @param configuration Configuration of the agent
   * @param agentId Id of the agent
   */
  createAgent<F extends Features> (configuration: Configuration<F>, agentId?: string): Promise<Agent<F>>

  /**
   * Deletes the given agent id from the current project.
   *
   * @param agentId Id of the agent
   */
  deleteAgent<F extends Features> (agentId: string): Promise<Agent<F>>

  /**
   * Deletes the public inspector URL for the given agent id.
   *
   * @param agentId Id of the agent
   */
  deleteSharedAgentInspectorUrl (agentId: string): Promise<void>

  /**
   * Retrieves the information about the given agent id.
   *
   * @param agentId Id of the agent
   */
  getAgent<F extends Features> (agentId: string): Promise<Agent<F>>

  /**
   * Retrieves the full context of the given agent id.
   *
   * If the timestamp is not provided the last pushed context operation timestamp is used as default.
   * @param agentId Id of the agent
   * @param timestamp Timestamp of the full context to be retrieved
   */
  getAgentContext<F extends Features> (agentId: string, timestamp?: number): Promise<ContextOperation<F>>

  /**
   * Retrieves every context operations pushed to the given agent id.
   *
   * @param agentId Id of the agent
   */
  getAgentContextOperations<F extends Features> (agentId: string): Promise<ContextOperation<F>[]>

  /**
   * Retrieves the decision tree of the given agent id.
   *
   * If the timestamp is not provided the last pushed context operation timestamp is used as default.
   * @param agentId Id of the agent
   * @param timestamp Timestamp of the tree to be retrieved
   */
  getAgentDecisionTree<F extends Features> (agentId: string, timestamp?: number): Promise<DecisionTree<F>>

  /**
   * Retrieves the public inspector URL for the given agent id.
   *
   * If the timestamp is not provided the last pushed context operation timestamp is used as default.
   * @param agentId Id of the agent
   * @param timestamp Default timestamp used to display the decision tree in the public inspector
   */
  getSharedAgentInspectorUrl (agentId: string, timestamp?: number): Promise<string>

  /**
   * List all agents id from the current project
   */
  listAgents (): Promise<string[]>

  /**
   * @deprecated Replaced by `client.deleteAgent()`
   */
  destroyAgent<F extends Features> (agentId: string): Promise<Agent<F>>

  /**
   * @deprecated Replaced by `client.getSharedAgentInspectorUrl()`
   */
  getAgentInspectorUrl (agentId: string, timestamp?: number): Promise<string>
}

export interface Time {
  timestamp: number
  timezone: string
  time_of_day: number
  day_of_month: number
  month_of_year: number
  day_of_week: number
  utc: string
}

export type ClientConfiguration = string | {
  token: string
  operationsChunksSize?: number
}

/**
 * Helper for time-related features generation
 */
export function Time (date: any): Time

/**
 * Computes the decision for a given context with the provided decision tree.
 *
 * @param tree Decision tree retrieved from craft ai (see `client.getAgentDecisionTree()`)
 * @param context Full context
 */
export function decide<F extends Features> (tree: DecisionTree<F>, context: Context<F>): Decision<F>

/**
 * Computes the decision for a given context with the provided decision tree.
 *
 * The partial context operations are merged from left to right to forge a single context.
 * The features of the right-most partial context operation overwrites the other.
 * `Time` instance is used to generate the time-related features and considered as a partial context operation.
 * @param tree Decision tree retrieved from craft ai (see `client.getAgentDecisionTree()`)
 * @param timeOrContextOperation A list of partial context operation or an instance of `Time`
 */
export function decide<F extends Features> (tree: DecisionTree<F>, ...timeOrContextOperation: (Partial<Context<F>> | Time)[]): Decision<F>

/**
 * Creates a client instance of craft ai.
 *
 * A client is bound to a project.
 * The configuration must include at least an access token to a craft ai project.
 * You can create a project and get an access token with your logged account on https://beta.craft.ai/projects.
 * @param configuration Configuration of the client
 */
export function createClient (configuration: ClientConfiguration): Client

export default createClient
