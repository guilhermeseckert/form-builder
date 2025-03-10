"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { renderPreviewComponent } from "./preview-component-renderer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import type { FormComponent } from "./types"

interface FormPreviewProps {
  components: FormComponent[]
  formName: string
}

export default function FormPreview({ components, formName }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any> | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, any>>({})

  // Function to recursively render all components
  const renderComponents = (components: FormComponent[]) => {
    return components.map((component) => {
      // Check if component should be visible based on conditions
      if (!evaluateConditions(component, formValues)) {
        return null
      }
      return (
        <div key={component.id} className="mb-4 last:mb-0">
          {renderPreviewComponent(component, errors, formValues, handleFieldChange)}
        </div>
      )
    })
  }

  // Function to collect all form fields recursively
  const collectFormFields = (components: FormComponent[]): FormComponent[] => {
    let fields: FormComponent[] = []

    components.forEach((component) => {
      if (["grid", "flex", "row", "column", "section"].includes(component.type)) {
        if (component.children && component.children.length > 0) {
          fields = [...fields, ...collectFormFields(component.children)]
        }
      } else {
        fields.push(component)
      }
    })

    return fields
  }

  // Handle form field changes
  const handleFieldChange = (name: string, value: any) => {
    console.log(`Field changed: ${name} = ${value} (${typeof value})`)

    setFormValues((prev) => {
      const newValues = {
        ...prev,
        [name]: value,
      }

      // Log all form values after update for debugging
      console.log("Updated form values:", newValues)

      return newValues
    })
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formFields = collectFormFields(components)
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    // Generate a UUID for this submission
    const submissionId = uuidv4()
    const submissionData = {
      ...formValues,
      submissionId,
      submittedAt: new Date().toISOString(),
    }

    // Validate form values
    formFields.forEach((field) => {
      const { name, type, props } = field
      const value = formValues[name]

      // Skip validation for fields that are not visible due to conditions
      if (!evaluateConditions(field, formValues)) {
        return
      }

      // Validate required fields
      if (props.required && (value === "" || value === undefined)) {
        newErrors[name] = `${props.label} is required`
        hasErrors = true
      }

      // Validate min/max length for text fields
      if (type === "text" && value) {
        if (props.minLength && value.length < props.minLength) {
          newErrors[name] = `${props.label} must be at least ${props.minLength} characters`
          hasErrors = true
        }
        if (props.maxLength && value.length > props.maxLength) {
          newErrors[name] = `${props.label} must be at most ${props.maxLength} characters`
          hasErrors = true
        }
      }

      // Validate min/max for number fields
      if (type === "number" && value !== undefined) {
        if (props.min !== undefined && value < props.min) {
          newErrors[name] = `${props.label} must be at least ${props.min}`
          hasErrors = true
        }
        if (props.max !== undefined && value > props.max) {
          newErrors[name] = `${props.label} must be at most ${props.max}`
          hasErrors = true
        }
      }

      // Validate email format
      if (type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          newErrors[name] = "Invalid email address"
          hasErrors = true
        }
      }

      // Validate phone number format
      if (type === "phoneNumber" && value) {
        const digits = value.replace(/\D/g, "")
        if (digits.length < 7 || digits.length > 15 || !/^[\d\s()+-]+$/.test(value)) {
          newErrors[name] = "Please enter a valid phone number"
          hasErrors = true
        }
      }
    })

    if (hasErrors) {
      setErrors(newErrors)
      setIsSubmitting(false)
      setSubmitted(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      setFormData(submissionData)
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1000)
  }

  const resetForm = () => {
    setFormData(null)
    setErrors({})
    setSubmitted(false)
    setFormValues({})
  }

  // Update the evaluateConditions function with proper types
  const evaluateConditions = (component: FormComponent, values: Record<string, unknown>): boolean => {
    // If no conditions, component is always visible
    if (!component.conditions || component.conditions.length === 0) {
      return true
    }

    // Check all conditions - component is visible only if ALL conditions are met
    return component.conditions.every((condition) => {
      const fieldValue = values[condition.field]

      switch (condition.operator) {
        case "equals":
          return fieldValue === condition.value
        case "notEquals":
          return fieldValue !== condition.value
        case "contains":
          return Array.isArray(fieldValue)
            ? fieldValue.includes(condition.value as string | number | boolean)
            : String(fieldValue).includes(String(condition.value))
        case "notContains":
          return Array.isArray(fieldValue)
            ? !fieldValue.includes(condition.value as string | number | boolean)
            : !String(fieldValue).includes(String(condition.value))
        case "isEmpty":
          return (
            fieldValue === undefined ||
            fieldValue === null ||
            fieldValue === "" ||
            (Array.isArray(fieldValue) && fieldValue.length === 0)
          )
        case "isNotEmpty":
          return (
            fieldValue !== undefined &&
            fieldValue !== null &&
            fieldValue !== "" &&
            (!Array.isArray(fieldValue) || fieldValue.length > 0)
          )
        default:
          return true
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      {submitted && formData ? (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Form Submitted Successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              Your form has been submitted with the following data:
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Submitted Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">{JSON.stringify(formData, null, 2)}</pre>
            </CardContent>
            <CardFooter>
              <Button onClick={resetForm}>Reset Form</Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{formName}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {components.length === 0 ? (
                <div className="text-center text-gray-500 p-8">
                  No components added yet. Add components in the Builder tab.
                </div>
              ) : (
                renderComponents(components)
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              {Object.keys(errors).length > 0 && (
                <Alert className="w-full bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Validation Error</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Please fix the errors in the form before submitting.
                  </AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={isSubmitting || components.length === 0}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  )
}

