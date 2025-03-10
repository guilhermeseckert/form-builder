"use client"

import { z } from "zod"
import type { FormComponent, Condition } from "./types"

// Helper function to generate condition check code
function generateConditionCheckCode(conditions: Condition[]): string {
  if (!conditions || conditions.length === 0) return "true"

  const conditionChecks = conditions.map((condition) => {
    const fieldRef = `form.getValues("${condition.field}")`

    switch (condition.operator) {
      case "equals":
        return `${fieldRef} === ${JSON.stringify(condition.value)}`
      case "notEquals":
        return `${fieldRef} !== ${JSON.stringify(condition.value)}`
      case "contains":
        return `Array.isArray(${fieldRef}) ? ${fieldRef}.includes(${JSON.stringify(condition.value)}) : String(${fieldRef}).includes(${JSON.stringify(condition.value)})`
      case "notContains":
        return `Array.isArray(${fieldRef}) ? !${fieldRef}.includes(${JSON.stringify(condition.value)}) : !String(${fieldRef}).includes(${JSON.stringify(condition.value)})`
      case "isEmpty":
        return `${fieldRef} === undefined || ${fieldRef} === null || ${fieldRef} === "" || (Array.isArray(${fieldRef}) && ${fieldRef}.length === 0)`
      case "isNotEmpty":
        return `${fieldRef} !== undefined && ${fieldRef} !== null && ${fieldRef} !== "" && (!Array.isArray(${fieldRef}) || ${fieldRef}.length > 0)`
      default:
        return "true"
    }
  })

  return conditionChecks.join(" && ")
}

export function generateDynamicSchema(components: FormComponent[]) {
  const schemaObj: Record<string, any> = {}

  // Process all components recursively
  const processComponents = (components: FormComponent[]) => {
    components.forEach((component) => {
      // Skip layout components for schema generation
      if (["grid", "flex", "row", "column", "section"].includes(component.type)) {
        // Process children of layout components
        if (component.children && component.children.length > 0) {
          processComponents(component.children)
        }
        return
      }

      const { type, props, name } = component

      let fieldSchema: any

      switch (type) {
        case "text":
          fieldSchema = z.string()
          if (props.required as boolean) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          if (props.minLength as number)
            fieldSchema = fieldSchema.min(props.minLength as number, {
              message: `${props.label} must be at least ${props.minLength} characters`,
            })
          if (props.maxLength as number)
            fieldSchema = fieldSchema.max(props.maxLength as number, {
              message: `${props.label} must be at most ${props.maxLength} characters`,
            })
          break

        case "email":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          fieldSchema = fieldSchema.email({ message: "Invalid email address" })
          break

        case "password":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          if (props.minLength)
            fieldSchema = fieldSchema.min(props.minLength, {
              message: `${props.label} must be at least ${props.minLength} characters`,
            })
          break

        case "tel":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          break

        case "phoneNumber":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          // Add phone number format validation
          fieldSchema = fieldSchema.refine(
            (val) => {
              if (!val) return !props.required
              // Get just the digits
              const digits = val.replace(/\D/g, "")

              // Check if we have the right number of digits (typically 10-15 for most countries)
              if (digits.length < 7 || digits.length > 15) return false

              // Basic format validation
              return /^[\d\s()+-]+$/.test(val)
            },
            { message: "Please enter a valid phone number" },
          )
          break

        case "url":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          // URL validation
          fieldSchema = fieldSchema.refine(
            (val) => {
              if (!val) return !props.required
              try {
                new URL(val)
                return true
              } catch {
                return false
              }
            },
            { message: "Invalid URL format" },
          )
          break

        case "currency":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          // Currency validation
          fieldSchema = fieldSchema.refine(
            (val) => {
              if (!val) return !props.required
              return /^-?\d*\.?\d*$/.test(val)
            },
            { message: "Invalid currency format" },
          )
          if (props.min !== undefined) {
            fieldSchema = fieldSchema.refine(
              (val) => {
                if (!val) return !props.required
                const num = Number.parseFloat(val)
                return isNaN(num) || num >= props.min
              },
              { message: `${props.label} must be at least ${props.min}` },
            )
          }
          break

        case "number":
          if (props.required) {
            fieldSchema = z.number({ required_error: `${props.label} is required` })
          } else {
            fieldSchema = z.number().optional()
          }

          // Create a separate schema for applying min/max constraints
          let numberSchema = z.number()
          if (props.min !== undefined)
            numberSchema = numberSchema.min(props.min, { message: `${props.label} must be at least ${props.min}` })
          if (props.max !== undefined)
            numberSchema = numberSchema.max(props.max, { message: `${props.label} must be at most ${props.max}` })

          // Apply the constraints using refine for both required and optional cases
          if (props.min !== undefined || props.max !== undefined) {
            fieldSchema = fieldSchema.refine(
              (val) => {
                if (val === undefined) return true // Skip validation if optional and undefined
                return numberSchema.safeParse(val).success
              },
              (val) => {
                if (val === undefined) return { message: "" } // No error for undefined optional values
                const result = numberSchema.safeParse(val)
                return { message: result.error ? result.error.errors[0].message : "" }
              },
            )
          }
          break

        case "textarea":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          break

        case "richtext":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          break

        case "signature":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          break

        case "select":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          break

        case "checkbox":
        case "switch":
          fieldSchema = z.boolean().default(false)
          if (props.required)
            fieldSchema = z.boolean().refine((val) => val === true, { message: `${props.label} is required` })
          break

        case "radio":
          fieldSchema = z.string()
          if (props.required) fieldSchema = fieldSchema.min(1, { message: `${props.label} is required` })
          break

        case "date":
          fieldSchema = z.date().optional()
          if (props.required) fieldSchema = z.date({ required_error: `${props.label} is required` })
          break

        default:
          fieldSchema = z.string()
      }

      // Add custom validation if provided
      if (props.customValidation && (props.customValidation as string).trim() !== "") {
        try {
          // Create a safe function from the string
          // eslint-disable-next-line no-new-func
          const validationFn = new Function("value", `return (${props.customValidation})(value)`)

          fieldSchema = fieldSchema.refine(
            (value: unknown) => {
              try {
                const result = validationFn(value)
                return result === true
              } catch (error) {
                console.error("Custom validation error:", error)
                return false
              }
            },
            (value: unknown) => {
              try {
                const result = validationFn(value)
                return { message: result === true ? "" : String(result) }
              } catch (error) {
                return { message: "Invalid custom validation" }
              }
            },
          )
        } catch (error) {
          console.error("Error creating validation function:", error)
        }
      }

      schemaObj[name] = fieldSchema
    })
  }

  // Start processing from root components
  processComponents(components)

  return z.object(schemaObj)
}

export function generateZodSchema(components: FormComponent[], formName: string) {
  console.log("Generating schema for components:", components, "with form name:", formName)
  let schema = `import { z } from "zod"\n\n`
  schema += `export const ${formName}Schema = z.object({\n`

  // Collect all form fields recursively
  const collectFields = (components: FormComponent[]): FormComponent[] => {
    let fields: FormComponent[] = []

    components.forEach((component) => {
      if (["grid", "flex", "row", "column", "section"].includes(component.type)) {
        if (component.children && component.children.length > 0) {
          fields = [...fields, ...collectFields(component.children)]
        }
      } else {
        fields.push(component)
      }
    })

    return fields
  }

  const formFields = collectFields(components)

  formFields.forEach((component) => {
    const { type, props, name } = component

    schema += `  ${name}: `

    switch (type) {
      case "text":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        if (props.minLength)
          schema += `.min(${props.minLength}, { message: "${props.label} must be at least ${props.minLength} characters" })`
        if (props.maxLength)
          schema += `.max(${props.maxLength}, { message: "${props.label} must be at most ${props.maxLength} characters" })`
        break

      case "email":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        schema += `.email({ message: "Invalid email address" })`
        break

      case "password":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        if (props.minLength)
          schema += `.min(${props.minLength}, { message: "${props.label} must be at least ${props.minLength} characters" })`
        break

      case "tel":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        break

      case "phoneNumber":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        schema += `.refine((val) => {
    if (!val) return ${!props.required};
    // Get just the digits
    const digits = val.replace(/\\D/g, "");
    
    // Check if we have the right number of digits (typically 10-15 for most countries)
    if (digits.length < 7 || digits.length > 15) return false;
    
    // Basic format validation
    return /^[\\d\\s()+\\-]+$/.test(val);
  }, { message: "Please enter a valid phone number" })`
        break

      case "url":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        schema += `.refine((val) => {
    if (!val) return ${!props.required};
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Invalid URL format" })`
        break

      case "currency":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        schema += `.refine((val) => !val || /^-?\\d*\\.?\\d*$/.test(val), { message: "Invalid currency format" })`
        if (props.min !== undefined) {
          schema += `.refine(
    (val) => {
      if (!val) return ${!props.required};
      const num = parseFloat(val);
      return isNaN(num) || num >= ${props.min};
    },
    { message: "${props.label} must be at least ${props.min}" }
  )`
        }
        break

      case "number":
        if (props.required) {
          schema += `z.number({ required_error: "${props.label} is required" })`
        } else {
          schema += `z.number().optional()`
        }
        if (props.min !== undefined)
          schema += `.min(${props.min}, { message: "${props.label} must be at least ${props.min}" })`
        if (props.max !== undefined)
          schema += `.max(${props.max}, { message: "${props.label} must be at most ${props.max}" })`
        break

      case "textarea":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        break

      case "richtext":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        break

      case "signature":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        break

      case "select":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        break

      case "checkbox":
      case "switch":
        if (props.required) {
          schema += `z.boolean().refine(val => val === true, { message: "${props.label} is required" })`
        } else {
          schema += `z.boolean().default(false)`
        }
        break

      case "radio":
        schema += `z.string()`
        if (props.required) schema += `.min(1, { message: "${props.label} is required" })`
        break

      case "date":
        if (props.required) {
          schema += `z.date({ required_error: "${props.label} is required" })`
        } else {
          schema += `z.date().optional()`
        }
        break
      case "dynamicList":
        schema += `z.array(`
        schema += `z.object({`

        // Generate schema for each field in the dynamic list
        if (props.fields && props.fields.length > 0) {
          props.fields.forEach((field: any, index: number) => {
            schema += `\n    ${field.name}: `

            if (field.type === "text") {
              schema += `z.string()`
              if (field.required) {
                schema += `.min(1, { message: "${field.label} is required" })`
              }
            } else if (field.type === "number") {
              if (field.required) {
                schema += `z.number({ required_error: "${field.label} is required" })`
              } else {
                schema += `z.number().optional()`
              }
            }

            // Add comma if not the last field
            if (index < props.fields.length - 1) {
              schema += `,`
            }
          })
        }

        schema += `\n  }))`

        // Add min/max validation
        if (props.minItems && props.minItems > 0) {
          schema += `.min(${props.minItems}, { message: "At least ${props.minItems} ${props.itemLabel || "item"}${props.minItems > 1 ? "s" : ""} required" })`
        }
        if (props.maxItems && props.maxItems > 0) {
          schema += `.max(${props.maxItems}, { message: "Maximum ${props.maxItems} ${props.itemLabel || "item"}${props.maxItems > 1 ? "s" : ""} allowed" })`
        }

        // Default to empty array
        schema += `.default([])`
        break

      default:
        schema += `z.string()`
    }

    // Add custom validation if provided
    if (props.customValidation && props.customValidation.trim() !== "") {
      schema += `.refine(\n`
      schema += `    ${props.customValidation},\n`
      schema += `    (value) => ({\n`
      schema += `      message: ${props.customValidation}(value) === true ? "" : String(${props.customValidation}(value))\n`
      schema += `    })\n`
      schema += `  )`
    }

    schema += `,\n`
  })

  schema += `})\n\n`
  schema += `export type ${formName}Type = z.infer<typeof ${formName}Schema>\n`

  return schema
}

export function generateFormCode(components: FormComponent[], formName: string) {
  console.log("Generating form code for components:", components, "with form name:", formName)
  let code = `"use client"\n\n`
  code += `import { zodResolver } from "@hookform/resolvers/zod"\n`
  code += `import { useForm } from "react-hook-form"\n\n`
  code += `import { Button } from "@/components/ui/button"\n`
  code += `import {\n  Form,\n  FormControl,\n  FormDescription,\n  FormField,\n  FormItem,\n  FormLabel,\n  FormMessage,\n} from "@/components/ui/form"\n`
  code += `import { DollarSign } from 'lucide-react'\n`

  // Collect all form fields and required components
  const collectFieldsAndComponents = (
    components: FormComponent[],
  ): {
    fields: FormComponent[]
    componentTypes: Set<string>
  } => {
    let fields: FormComponent[] = []
    const componentTypes = new Set<string>()

    components.forEach((component) => {
      if (["grid", "flex", "row", "column", "section"].includes(component.type)) {
        componentTypes.add(component.type)
        if (component.children && component.children.length > 0) {
          const { fields: childFields, componentTypes: childTypes } = collectFieldsAndComponents(component.children)
          fields = [...fields, ...childFields]
          childTypes.forEach((type) => componentTypes.add(type))
        }
      } else {
        fields.push(component)
        componentTypes.add(component.type)
      }
    })

    return { fields, componentTypes }
  }

  const { fields, componentTypes } = collectFieldsAndComponents(components)

  // Import necessary components
  if (
    componentTypes.has("text") ||
    componentTypes.has("email") ||
    componentTypes.has("password") ||
    componentTypes.has("tel") ||
    componentTypes.has("number") ||
    componentTypes.has("url")
  ) {
    code += `import { Input } from "@/components/ui/input"\n`
  }

  if (componentTypes.has("textarea")) {
    code += `import { Textarea } from "@/components/ui/textarea"\n`
  }

  if (componentTypes.has("select")) {
    code += `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"\n`
  }

  if (componentTypes.has("checkbox")) {
    code += `import { Checkbox } from "@/components/ui/checkbox"\n`
  }

  if (componentTypes.has("switch")) {
    code += `import { Switch } from "@/components/ui/switch"\n`
  }

  if (componentTypes.has("radio")) {
    code += `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"\n`
  }

  if (componentTypes.has("date")) {
    code += `import { Calendar } from "@/components/ui/calendar"\n`
    code += `import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"\n`
    code += `import { CalendarIcon } from 'lucide-react'\n`
    code += `import { format } from "date-fns"\n`
  }

  if (componentTypes.has("section")) {
    code += `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"\n`
  }

  if (componentTypes.has("checkbox") || componentTypes.has("radio")) {
    code += `import { Label } from "@/components/ui/label"\n`
  }

  if (componentTypes.has("richtext")) {
    code += `import { RichTextEditor } from "./rich-text-editor"\n`
  }

  if (componentTypes.has("signature")) {
    code += `import { SignaturePad } from "./signature-pad"\n`
  }

  if (componentTypes.has("phoneNumber")) {
    code += `import { useState } from "react"\n`
  }

  code += `\nimport { ${formName}Schema, ${formName}Type } from "./schema"\n\n`

  // Add helper components if needed
  if (componentTypes.has("phoneNumber")) {
    code += `// Phone number input with formatting and validation\n`
    code += `function PhoneNumberInput({ value, onChange, placeholder, format }) {\n`
    code += `  const [isValid, setIsValid] = useState(true)\n\n`
    code += `  const formatPhoneNumber = (input) => {\n`
    code += `    // Remove all non-digit characters\n`
    code += `    const digits = input.replace(/\\D/g, "")\n`
    code += `    \n`
    code += `    // Apply the format\n`
    code += `    let formatted = format\n`
    code += `    for (let i = 0; i < digits.length && i < format.replace(/[^#]/g, "").length; i++) {\n`
    code += `      formatted = formatted.replace("#", digits[i])\n`
    code += `    }\n`
    code += `    \n`
    code += `    // Remove any remaining # placeholders\n`
    code += `    formatted = formatted.replace(/#/g, "")\n`
    code += `    \n`
    code += `    return formatted\n`
    code += `  }\n\n`
    code += `  const validatePhoneNumber = (value) => {\n`
    code += `    if (!value) return true;\n`
    code += `    \n`
    code += `    // Get just the digits\n`
    code += `    const digits = value.replace(/\\D/g, "");\n`
    code += `    \n`
    code += `    // Check if we have the right number of digits (typically 10-15 for most countries)\n`
    code += `    if (digits.length < 7 || digits.length > 15) return false;\n`
    code += `    \n`
    code += `    // Basic format validation\n`
    code += `    return /^[\\d\\s()+\\-]+$/.test(value);\n`
    code += `  }\n\n`
    code += `  const handleChange = (e) => {\n`
    code += `    const input = e.target.value\n`
    code += `    const formatted = formatPhoneNumber(input)\n`
    code += `    onChange(formatted)\n`
    code += `    setIsValid(validatePhoneNumber(formatted))\n`
    code += `  }\n\n`
    code += `  return (\n`
    code += `    <Input\n`
    code += `      type="tel"\n`
    code += `      placeholder={placeholder}\n`
    code += `      value={value}\n`
    code += `      onChange={handleChange}\n`
    code += `      className={!isValid ? "border-red-500" : ""}\n`
    code += `    />\n`
    code += `  )\n`
    code += `}\n\n`
  }

  if (componentTypes.has("currency")) {
    code += `// Currency input component\n`
    code += `function CurrencyInput({ value, onChange, placeholder, currency }) {\n`
    code += `  const formatCurrency = (input) => {\n`
    code += `    // Remove all non-digit characters except decimal point\n`
    code += `    const cleaned = input.replace(/[^\\d.]/g, "")\n`
    code += `    \n`
    code += `    // Ensure only one decimal point\n`
    code += `    const parts = cleaned.split(".")\n`
    code += `    if (parts.length > 2) {\n`
    code += `      return parts[0] + "." + parts.slice(1).join("")\n`
    code += `    }\n`
    code += `    \n`
    code += `    return cleaned\n`
    code += `  }\n`
    code += `\n`
    code += `  const handleChange = (e) => {\n`
    code += `    const input = e.target.value\n`
    code += `    const formatted = formatCurrency(input)\n`
    code += `    onChange(formatted)\n`
    code += `  }\n`
    code += `\n`
    code += `  const currencySymbol = \n`
    code += `    currency === "USD" ? "$" : \n`
    code += `    currency === "EUR" ? "€" : \n`
    code += `    currency === "GBP" ? "£" : \n`
    code += `    currency\n`
    code += `\n`
    code += `  return (\n`
    code += `    <div className="relative">\n`
    code += `      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">\n`
    code += `        {currencySymbol}\n`
    code += `      </span>\n`
    code += `      <Input\n`
    code += `        type="text"\n`
    code += `        placeholder={placeholder}\n`
    code += `        value={value}\n`
    code += `        onChange={handleChange}\n`
    code += `        className="pl-8"\n`
    code += `      />\n`
    code += `    </div>\n`
    code += `  )\n`
    code += `}\n\n`
  }

  code += `export function ${formName}() {\n`
  code += `  const form = useForm<${formName}Type>({\n`
  code += `    resolver: zodResolver(${formName}Schema),\n`
  code += `    defaultValues: {\n`

  // Generate default values
  fields.forEach((component) => {
    const { type, name } = component

    if (type === "checkbox" || type === "switch") {
      code += `      ${name}: false,\n`
    } else if (type === "number") {
      code += `      ${name}: undefined,\n`
    } else if (type === "date") {
      code += `      ${name}: undefined,\n`
    } else if (type === "dynamicList") {
      code += `      ${name}: [],\n`
    } else {
      code += `      ${name}: "",\n`
    }
  })

  code += `    },\n`
  code += `  })\n\n`

  code += `  function onSubmit(values: ${formName}Type) {\n`
  code += `    // Do something with the form values\n`
  code += `    console.log(values)\n`
  code += `  }\n\n`

  code += `  return (\n`
  code += `    <Form {...form}>\n`
  code += `      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">\n`

  // Helper function to render components recursively
  const renderComponents = (components: FormComponent[], indentLevel = 2): string => {
    const indent = " ".repeat(indentLevel * 2)
    let result = ""

    components.forEach((component) => {
      // Add conditional rendering if component has conditions
      if (component.conditions && component.conditions.length > 0) {
        result += `${indent}{/* Conditional rendering */}\n`
        result += `${indent}{(() => {\n`
        result += `${indent}  // Check if component should be visible based on conditions\n`
        result += `${indent}  const isVisible = ${generateConditionCheckCode(component.conditions)};\n`
        result += `${indent}  if (!isVisible) return null;\n`
        result += `${indent}  return (\n`
      }

      if (component.type === "grid") {
        result += `${indent}${component.conditions ? "  " : ""}<div className="grid grid-cols-${component.props.columns || 2} gap-${component.props.gap || 4}">\n`
        if (component.children && component.children.length > 0) {
          result += renderComponents(component.children, indentLevel + 1 + (component.conditions ? 1 : 0))
        }
        result += `${indent}${component.conditions ? "  " : ""}</div>\n`
      } else if (component.type === "flex") {
        result += `${indent}${component.conditions ? "  " : ""}<div className="flex ${component.props.direction === "column" ? "flex-col" : "flex-row"} ${component.props.wrap ? "flex-wrap" : "flex-nowrap"} gap-${component.props.gap || 4} justify-${component.props.justify || "between"} items-${component.props.align || "center"}">\n`
        if (component.children && component.children.length > 0) {
          result += renderComponents(component.children, indentLevel + 1 + (component.conditions ? 1 : 0))
        }
        result += `${indent}${component.conditions ? "  " : ""}</div>\n`
      } else if (component.type === "row") {
        result += `${indent}${component.conditions ? "  " : ""}<div className="flex flex-row gap-${component.props.gap || 4}">\n`
        if (component.children && component.children.length > 0) {
          result += renderComponents(component.children, indentLevel + 1 + (component.conditions ? 1 : 0))
        }
        result += `${indent}${component.conditions ? "  " : ""}</div>\n`
      } else if (component.type === "column") {
        result += `${indent}${component.conditions ? "  " : ""}<div className="flex flex-col gap-${component.props.gap || 4}">\n`
        if (component.children && component.children.length > 0) {
          result += renderComponents(component.children, indentLevel + 1 + (component.conditions ? 1 : 0))
        }
        result += `${indent}${component.conditions ? "  " : ""}</div>\n`
      } else if (component.type === "section") {
        result += `${indent}${component.conditions ? "  " : ""}<Card>\n`
        result += `${indent}${component.conditions ? "  " : ""}  <CardHeader>\n`
        result += `${indent}${component.conditions ? "  " : ""}    <CardTitle>${component.props.title || "Section Title"}</CardTitle>\n`
        if (component.props.description) {
          result += `${indent}${component.conditions ? "  " : ""}    <CardDescription>${component.props.description}</CardDescription>\n`
        }
        result += `${indent}${component.conditions ? "  " : ""}  </CardHeader>\n`
        result += `${indent}${component.conditions ? "  " : ""}  <CardContent>\n`
        if (component.children && component.children.length > 0) {
          result += renderComponents(component.children, indentLevel + 2 + (component.conditions ? 1 : 0))
        }
        result += `${indent}${component.conditions ? "  " : ""}  </CardContent>\n`
        result += `${indent}${component.conditions ? "  " : ""}</Card>\n`
      } else {
        // Generate form field
        result += generateFormField(component, indentLevel + (component.conditions ? 1 : 0))
      }

      // Close conditional rendering if component has conditions
      if (component.conditions && component.conditions.length > 0) {
        result += `${indent}  );\n`
        result += `${indent}})()}\n`
      }
    })

    return result
  }

  // Helper function to generate a form field
  const generateFormField = (component: FormComponent, indentLevel: number): string => {
    const { type, props, name } = component
    const indent = " ".repeat(indentLevel * 2)

    let field = `${indent}<FormField\n`
    field += `${indent}  control={form.control}\n`
    field += `${indent}  name="${name}"\n`
    field += `${indent}  render={({ field }) => (\n`

    // Parse custom props if available
    let customPropsStr = ""
    if (props.customProps && props.customProps.trim() !== "") {
      try {
        const customProps = JSON.parse(props.customProps)
        customPropsStr = Object.entries(customProps)
          .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
          .join(" ")
      } catch (error) {
        console.error("Error parsing custom props:", error)
      }
    }

    switch (type) {
      case "text":
      case "email":
      case "password":
      case "tel":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <Input type="${type}" placeholder="${props.placeholder}" ${customPropsStr} {...field} />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "url":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <Input type="url" placeholder="${props.placeholder}" ${customPropsStr} {...field} />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "phoneNumber":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <PhoneNumberInput\n`
        field += `${indent}          placeholder="${props.placeholder}"\n`
        field += `${indent}          format="${props.format}"\n`
        field += `${indent}          value={field.value}\n`
        field += `${indent}          onChange={field.onChange}\n`
        field += `${indent}          ${customPropsStr}\n`
        field += `${indent}        />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormDescription>Format: ${props.format}</FormDescription>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "currency":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <CurrencyInput\n`
        field += `${indent}          placeholder="${props.placeholder}"\n`
        field += `${indent}          currency="${props.currency}"\n`
        field += `${indent}          value={field.value}\n`
        field += `${indent}          onChange={field.onChange}\n`
        field += `${indent}          ${customPropsStr}\n`
        field += `${indent}        />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "number":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <Input\n`
        field += `${indent}          type="number"\n`
        field += `${indent}          placeholder="${props.placeholder}"\n`
        field += `${indent}          ${customPropsStr}\n`
        field += `${indent}          {...field}\n`
        field += `${indent}          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}\n`
        field += `${indent}        />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "textarea":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <Textarea placeholder="${props.placeholder}" rows={${props.rows}} ${customPropsStr} {...field} />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "select":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <Select onValueChange={field.onChange} defaultValue={field.value}>\n`
        field += `${indent}        <FormControl>\n`
        field += `${indent}          <SelectTrigger ${customPropsStr}>\n`
        field += `${indent}            <SelectValue placeholder="${props.placeholder}" />\n`
        field += `${indent}          </SelectTrigger>\n`
        field += `${indent}        </FormControl>\n`
        field += `${indent}        <SelectContent>\n`
        props.options.forEach((option: { value: string; label: string }) => {
          field += `${indent}          <SelectItem value="${option.value}">${option.label}</SelectItem>\n`
        })
        field += `${indent}        </SelectContent>\n`
        field += `${indent}      </Select>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "checkbox":
        field += `${indent}    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <Checkbox\n`
        field += `${indent}          checked={field.value}\n`
        field += `${indent}          onCheckedChange={field.onChange}\n`
        field += `${indent}          ${customPropsStr}\n`
        field += `${indent}        />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <div className="space-y-1 leading-none">\n`
        field += `${indent}        <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}        <FormMessage />\n`
        field += `${indent}      </div>\n`
        field += `${indent}    </FormItem>\n`
        break

      case "switch":
        field += `${indent}    <FormItem className="flex flex-row items-center justify-between rounded-md p-4">\n`
        field += `${indent}      <div className="space-y-0.5">\n`
        field += `${indent}        <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      </div>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <Switch\n`
        field += `${indent}          checked={field.value}\n`
        field += `${indent}          onCheckedChange={field.onChange}\n`
        field += `${indent}          ${customPropsStr}\n`
        field += `${indent}        />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "radio":
        field += `${indent}    <FormItem className="space-y-3">\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <RadioGroup\n`
        field += `${indent}          onValueChange={field.onChange}\n`
        field += `${indent}          defaultValue={field.value}\n`
        field += `${indent}          className="flex flex-col space-y-1"\n`
        field += `${indent}          ${customPropsStr}\n`
        field += `${indent}        >\n`
        props.options.forEach((option: { value: string; label: string }) => {
          field += `${indent}          <div className="flex items-center space-x-2">\n`
          field += `${indent}            <RadioGroupItem value="${option.value}" id="${name}-${option.value}" />\n`
          field += `${indent}            <Label htmlFor="${name}-${option.value}">${option.label}</Label>\n`
          field += `${indent}          </div>\n`
        })
        field += `${indent}        </RadioGroup>\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "date":
        field += `${indent}    <FormItem className="flex flex-col">\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <Popover>\n`
        field += `${indent}        <PopoverTrigger asChild>\n`
        field += `${indent}          <FormControl>\n`
        field += `${indent}            <Button\n`
        field += `${indent}              variant={"outline"}\n`
        field += `${indent}              className={\`w-full pl-3 text-left font-normal \${!field.value ? "text-muted-foreground" : ""}\`}\n`
        field += `${indent}              ${customPropsStr}\n`
        field += `${indent}            >\n`
        field += `${indent}              {field.value ? (\n`
        field += `${indent}                format(field.value, "PPP")\n`
        field += `${indent}              ) : (\n`
        field += `${indent}                <span>Pick a date</span>\n`
        field += `${indent}              )}\n`
        field += `${indent}              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />\n`
        field += `${indent}            </Button>\n`
        field += `${indent}          </FormControl>\n`
        field += `${indent}        </PopoverTrigger>\n`
        field += `${indent}        <PopoverContent className="w-auto p-0" align="start">\n`
        field += `${indent}          <Calendar\n`
        field += `${indent}            mode="single"\n`
        field += `${indent}            selected={field.value}\n`
        field += `${indent}            onSelect={field.onChange}\n`
        field += `${indent}            initialFocus\n`
        field += `${indent}          />\n`
        field += `${indent}        </PopoverContent>\n`
        field += `${indent}      </Popover>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "richtext":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <RichTextEditor\n`
        field += `${indent}          value={field.value}\n`
        field += `${indent}          onChange={field.onChange}\n`
        field += `${indent}          placeholder="${props.placeholder}"\n`
        field += `${indent}          ${customPropsStr}\n`
        field += `${indent}        />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break

      case "signature":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        field += `${indent}        <SignaturePad\n`
        field += `${indent}          value={field.value}\n`
        field += `${indent}          onChange={field.onChange}\n`
        field += `${indent}          width={${props.width}}\n`
        field += `${indent}          height={${props.height}}\n`
        field += `${indent}          ${customPropsStr}\n`
        field += `${indent}        />\n`
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break
      case "dynamicList":
        field += `${indent}    <FormItem>\n`
        field += `${indent}      <FormLabel>${props.label}</FormLabel>\n`
        field += `${indent}      <FormControl>\n`
        // Add dynamic list rendering logic here
        field += `${indent}      </FormControl>\n`
        field += `${indent}      <FormMessage />\n`
        field += `${indent}    </FormItem>\n`
        break
    }

    field += `${indent}  )}\n`
    field += `${indent}/>\n`

    return field
  }

  // Generate form fields
  code += renderComponents(components)

  code += `        <Button type="submit">Submit</Button>\n`
  code += `      </form>\n`
  code += `    </Form>\n`
  code += `  )\n`
  code += `}\n`
  return code
}

