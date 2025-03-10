export type FieldType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "number"
  | "url"
  | "textarea"
  | "select"
  | "checkbox"
  | "switch"
  | "radio"
  | "date"
  | "richtext"
  | "signature"
  | "phoneNumber"
  | "currency"
  | "dynamicList"
  | "grid"
  | "flex"
  | "row"
  | "column"
  | "section"

export type OperatorType = "equals" | "notEquals" | "contains" | "notContains" | "isEmpty" | "isNotEmpty"

export interface SelectOption {
  label: string
  value: string
}

export interface DynamicListField {
  name: string
  label: string
  type: string
  required: boolean
}

// Add the Condition type and update FormComponent to include conditions
export interface Condition {
  field: string // The field name to check
  operator: OperatorType
  value?: string | number | boolean // The value to compare against (not needed for isEmpty/isNotEmpty)
}

export interface FormComponent {
  id: string
  type: FieldType
  name: string
  props: Record<string, unknown>
  children?: FormComponent[] // For layout components that can contain other components
  parentId?: string // To track parent-child relationships
  conditions?: Condition[] // Conditions that determine when this component should be visible
}

export interface FormConfiguration {
  name: string
  components: FormComponent[]
  version: string
  createdAt: string
}

export interface LayoutProperties {
  columns?: number
  gap?: number
  direction?: "row" | "column"
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly"
  align?: "start" | "end" | "center" | "stretch" | "baseline"
  wrap?: boolean
}

