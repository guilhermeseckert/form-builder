"use client"

import { useState } from "react"
import { PlusCircle, Trash, Settings2, X } from "lucide-react"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import type { FormComponent } from "./types"
import { ValidationExamples } from "./validation-examples"
import { ConditionsExamples } from "./conditions-examples"
import { AdvancedPropsExamples } from "./advanced-props-examples"
import { CodeEditor } from "./code-editor"

interface PropertiesPanelProps {
  selectedComponent: FormComponent | null
  onUpdateComponent: (component: FormComponent | null) => void
  formName: string
  onUpdateFormName: (name: string) => void
  allComponents?: FormComponent[]
}

type SelectOption = {
  label: string
  value: string
}

type OperatorType = "equals" | "notEquals" | "contains" | "notContains" | "isEmpty" | "isNotEmpty" | string

export default function PropertiesPanel({
  selectedComponent,
  onUpdateComponent,
  formName,
  onUpdateFormName,
  allComponents,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState("basic")

  // Replace the handlePropertyChange function with this typed version
  const handlePropertyChange = <T,>(property: string, value: T) => {
    if (!selectedComponent) return

    const updatedComponent = {
      ...selectedComponent,
      props: {
        ...selectedComponent.props,
        [property]: value,
      },
    }
    onUpdateComponent(updatedComponent)
  }

  const handleNameChange = (value: string) => {
    if (!selectedComponent) return

    const updatedComponent = {
      ...selectedComponent,
      name: value,
    }
    onUpdateComponent(updatedComponent)
  }

  const handleAddOption = () => {
    if (!selectedComponent) return
    if (!selectedComponent.props.options) return

    const updatedComponent = {
      ...selectedComponent,
      props: {
        ...selectedComponent.props,
        options: [
          ...selectedComponent.props.options,
          {
            label: `Option ${selectedComponent.props.options.length + 1}`,
            value: `option${selectedComponent.props.options.length + 1}`,
          },
        ],
      },
    }
    onUpdateComponent(updatedComponent)
  }

  // Replace the handleUpdateOption function with this typed version
  const handleUpdateOption = (index: number, field: "label" | "value", value: string) => {
    if (!selectedComponent || !selectedComponent.props.options) return

    const updatedOptions = [...(selectedComponent.props.options as SelectOption[])]
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    }

    const updatedComponent = {
      ...selectedComponent,
      props: {
        ...selectedComponent.props,
        options: updatedOptions,
      },
    }
    onUpdateComponent(updatedComponent)
  }

  const handleRemoveOption = (index: number) => {
    if (!selectedComponent || !selectedComponent.props.options) return

    const updatedOptions = [...selectedComponent.props.options]
    updatedOptions.splice(index, 1)

    const updatedComponent = {
      ...selectedComponent,
      props: {
        ...selectedComponent.props,
        options: updatedOptions,
      },
    }
    onUpdateComponent(updatedComponent)
  }

  // Check if the selected component is a layout component
  const isLayoutComponent =
    selectedComponent && ["grid", "flex", "row", "column", "section"].includes(selectedComponent.type)

  const getAllFieldNames = () => {
    if (!allComponents) return []

    const fieldNames: string[] = []

    const collectFieldNames = (components: FormComponent[]) => {
      components.forEach((component) => {
        // Skip the currently selected component to avoid circular dependencies
        if (component.id === selectedComponent?.id) return

        // Add field name if it's an input component
        if (!["grid", "flex", "row", "column", "section"].includes(component.type)) {
          fieldNames.push(component.name)
        }

        // Process children recursively
        if (component.children && component.children.length > 0) {
          collectFieldNames(component.children)
        }
      })
    }

    collectFieldNames(allComponents)

    // Log the collected field names for debugging
    console.log("Available fields for conditions:", fieldNames)

    return fieldNames
  }

  // Helper function to check if a field is a boolean type (switch or checkbox)
  const isBooleanField = (fieldName: string, components?: FormComponent[]): boolean => {
    if (!components || !fieldName) return false

    // Find the component with the matching name
    const findComponent = (components: FormComponent[]): FormComponent | undefined => {
      for (const component of components) {
        if (component.name === fieldName) {
          return component
        }
        if (component.children && component.children.length > 0) {
          const found = findComponent(component.children)
          if (found) return found
        }
      }
      return undefined
    }

    const component = findComponent(components)
    return component?.type === "switch" || component?.type === "checkbox"
  }

  return (
    <div className="relative">
      {/* Floating indicator when a component is selected */}
      {selectedComponent && (
        <Card className="mb-4 bg-muted/50 border-primary">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <Settings2 className="h-4 w-4 mr-2" />
                Editing: {selectedComponent.name || selectedComponent.type}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onUpdateComponent(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <Drawer open={!!selectedComponent} onOpenChange={(open) => !open && onUpdateComponent(null)}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle>{selectedComponent ? `Edit ${selectedComponent.type} Properties` : "Properties"}</DrawerTitle>
            <DrawerDescription>
              {selectedComponent
                ? `Configure the properties for ${selectedComponent.name || selectedComponent.type}`
                : "Select a component to edit its properties"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 overflow-y-auto">
            <div className="space-y-2 mb-4">
              <Label htmlFor="formName">Form Name</Label>
              <Input id="formName" value={formName} onChange={(e) => onUpdateFormName(e.target.value)} />
            </div>

            {!selectedComponent ? (
              <div className="text-center text-gray-500 p-8">
                <Settings2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No Component Selected</p>
                <p>Click on a component in the form canvas to edit its properties</p>
              </div>
            ) : (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="componentName">Field Name</Label>
                    <Input
                      id="componentName"
                      value={selectedComponent.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full flex flex-wrap">
                      <div className="flex flex-1 min-w-[200px]">
                        <TabsTrigger value="basic" className="flex-1">
                          Basic
                        </TabsTrigger>
                        {!isLayoutComponent ? (
                          <TabsTrigger value="validation" className="flex-1">
                            Validation
                          </TabsTrigger>
                        ) : (
                          <TabsTrigger value="layout" className="flex-1">
                            Layout
                          </TabsTrigger>
                        )}
                      </div>
                      <div className="flex flex-1 min-w-[200px]">
                        <TabsTrigger value="conditions" className="flex-1">
                          Conditions
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="flex-1">
                          Advanced
                        </TabsTrigger>
                      </div>
                    </TabsList>

                    {/* Basic tab content */}
                    <TabsContent value="basic" className="space-y-4 mt-4">
                      {/* Input components */}
                      {!isLayoutComponent && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="componentLabel">Label</Label>
                            <Input
                              id="componentLabel"
                              value={selectedComponent.props.label}
                              onChange={(e) => handlePropertyChange("label", e.target.value)}
                            />
                          </div>

                          {["text", "email", "password", "tel", "number", "textarea", "select"].includes(
                            selectedComponent.type,
                          ) && (
                            <div className="space-y-2">
                              <Label htmlFor="componentPlaceholder">Placeholder</Label>
                              <Input
                                id="componentPlaceholder"
                                value={selectedComponent.props.placeholder}
                                onChange={(e) => handlePropertyChange("placeholder", e.target.value)}
                              />
                            </div>
                          )}

                          {selectedComponent.type === "textarea" && (
                            <div className="space-y-2">
                              <Label htmlFor="componentRows">Rows</Label>
                              <Input
                                id="componentRows"
                                type="number"
                                value={selectedComponent.props.rows}
                                onChange={(e) => handlePropertyChange("rows", Number.parseInt(e.target.value))}
                              />
                            </div>
                          )}

                          {["select", "radio"].includes(selectedComponent.type) && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Options</Label>
                                <Button size="sm" variant="outline" onClick={handleAddOption} className="h-8 px-2">
                                  <PlusCircle className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {selectedComponent.props.options.map((option: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <Input
                                      value={option.label}
                                      onChange={(e) => handleUpdateOption(index, "label", e.target.value)}
                                      placeholder="Label"
                                      className="flex-1"
                                    />
                                    <Input
                                      value={option.value}
                                      onChange={(e) => handleUpdateOption(index, "value", e.target.value)}
                                      placeholder="Value"
                                      className="flex-1"
                                    />
                                    <Button size="icon" variant="ghost" onClick={() => handleRemoveOption(index)}>
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedComponent.type === "dynamicList" && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="itemLabel">Item Label</Label>
                                <Input
                                  id="itemLabel"
                                  value={selectedComponent.props.itemLabel || "Item"}
                                  onChange={(e) => handlePropertyChange("itemLabel", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="addButtonText">Add Button Text</Label>
                                <Input
                                  id="addButtonText"
                                  value={selectedComponent.props.addButtonText || "Add Item"}
                                  onChange={(e) => handlePropertyChange("addButtonText", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Fields</Label>
                                <div className="border rounded-md p-3 space-y-3">
                                  {selectedComponent.props.fields?.map((field: any, index: number) => (
                                    <div key={index} className="space-y-2 border-b pb-3 last:border-0 last:pb-0">
                                      <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-medium">Field #{index + 1}</h4>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            const updatedFields = [...selectedComponent.props.fields]
                                            updatedFields.splice(index, 1)
                                            handlePropertyChange("fields", updatedFields)
                                          }}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <Label className="text-xs">Name</Label>
                                          <Input
                                            value={field.name}
                                            onChange={(e) => {
                                              const updatedFields = [...selectedComponent.props.fields]
                                              updatedFields[index] = { ...field, name: e.target.value }
                                              handlePropertyChange("fields", updatedFields)
                                            }}
                                            placeholder="field_name"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Label</Label>
                                          <Input
                                            value={field.label}
                                            onChange={(e) => {
                                              const updatedFields = [...selectedComponent.props.fields]
                                              updatedFields[index] = { ...field, label: e.target.value }
                                              handlePropertyChange("fields", updatedFields)
                                            }}
                                            placeholder="Field Label"
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <Label className="text-xs">Type</Label>
                                          <Select
                                            value={field.type}
                                            onValueChange={(value) => {
                                              const updatedFields = [...selectedComponent.props.fields]
                                              updatedFields[index] = { ...field, type: value }
                                              handlePropertyChange("fields", updatedFields)
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="text">Text</SelectItem>
                                              <SelectItem value="number">Number</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex items-end">
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`field-required-${index}`}
                                              checked={field.required}
                                              onCheckedChange={(checked) => {
                                                const updatedFields = [...selectedComponent.props.fields]
                                                updatedFields[index] = { ...field, required: checked === true }
                                                handlePropertyChange("fields", updatedFields)
                                              }}
                                            />
                                            <Label htmlFor={`field-required-${index}`}>Required</Label>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updatedFields = [
                                        ...(selectedComponent.props.fields || []),
                                        {
                                          name: `field_${selectedComponent.props.fields?.length || 0 + 1}`,
                                          label: "New Field",
                                          type: "text",
                                          required: false,
                                        },
                                      ]
                                      handlePropertyChange("fields", updatedFields)
                                    }}
                                  >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Field
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* Layout components */}
                      {selectedComponent.type === "section" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="sectionTitle">Section Title</Label>
                            <Input
                              id="sectionTitle"
                              value={selectedComponent.props.title}
                              onChange={(e) => handlePropertyChange("title", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sectionDescription">Description</Label>
                            <Textarea
                              id="sectionDescription"
                              value={selectedComponent.props.description}
                              onChange={(e) => handlePropertyChange("description", e.target.value)}
                              rows={2}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sectionCollapsible"
                              checked={selectedComponent.props.collapsible}
                              onCheckedChange={(checked) => handlePropertyChange("collapsible", checked)}
                            />
                            <Label htmlFor="sectionCollapsible">Collapsible</Label>
                          </div>
                        </>
                      )}
                    </TabsContent>

                    {/* Validation tab content */}
                    {!isLayoutComponent && (
                      <TabsContent value="validation" className="space-y-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="componentRequired"
                            checked={selectedComponent.props.required}
                            onCheckedChange={(checked) => handlePropertyChange("required", checked)}
                          />
                          <Label htmlFor="componentRequired">Required</Label>
                        </div>

                        {selectedComponent.type === "text" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="componentMinLength">Min Length</Label>
                              <Input
                                id="componentMinLength"
                                type="number"
                                value={selectedComponent.props.minLength}
                                onChange={(e) => handlePropertyChange("minLength", Number.parseInt(e.target.value))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="componentMaxLength">Max Length</Label>
                              <Input
                                id="componentMaxLength"
                                type="number"
                                value={selectedComponent.props.maxLength}
                                onChange={(e) => handlePropertyChange("maxLength", Number.parseInt(e.target.value))}
                              />
                            </div>
                          </>
                        )}

                        {selectedComponent.type === "number" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="componentMin">Min Value</Label>
                              <Input
                                id="componentMin"
                                type="number"
                                value={selectedComponent.props.min}
                                onChange={(e) => handlePropertyChange("min", Number.parseInt(e.target.value))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="componentMax">Max Value</Label>
                              <Input
                                id="componentMax"
                                type="number"
                                value={selectedComponent.props.max}
                                onChange={(e) => handlePropertyChange("max", Number.parseInt(e.target.value))}
                              />
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="customValidation">Custom Validation (JavaScript)</Label>
                            <ValidationExamples />
                          </div>
                          {/* Replace textarea with CodeEditor */}
                          <CodeEditor
                            value={selectedComponent.props.customValidation || ""}
                            onChange={(value) => handlePropertyChange("customValidation", value)}
                            placeholder="(value) => { return value === 'expected' ? true : 'Error message' }"
                            height="200px"
                          />
                          <p className="text-xs text-muted-foreground">
                            Write a function that takes the field value and returns true if valid or an error message
                            string if invalid.
                          </p>
                        </div>

                        {selectedComponent.type === "dynamicList" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="minItems">Minimum Items</Label>
                              <Input
                                id="minItems"
                                type="number"
                                min="0"
                                value={selectedComponent.props.minItems || 0}
                                onChange={(e) => handlePropertyChange("minItems", Number(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Minimum number of items required (0 = no minimum)
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxItems">Maximum Items</Label>
                              <Input
                                id="maxItems"
                                type="number"
                                min="0"
                                value={selectedComponent.props.maxItems || 0}
                                onChange={(e) => handlePropertyChange("maxItems", Number(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Maximum number of items allowed (0 = no maximum)
                              </p>
                            </div>
                          </>
                        )}
                      </TabsContent>
                    )}

                    {/* Layout tab content */}
                    {isLayoutComponent && (
                      <TabsContent value="layout" className="space-y-4 mt-4">
                        {selectedComponent.type === "grid" && (
                          <div className="space-y-2">
                            <Label htmlFor="gridColumns">Columns</Label>
                            <Select
                              value={selectedComponent.props.columns?.toString() || "2"}
                              onValueChange={(value) => handlePropertyChange("columns", Number.parseInt(value))}
                            >
                              <SelectTrigger id="gridColumns">
                                <SelectValue placeholder="Select columns" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Column</SelectItem>
                                <SelectItem value="2">2 Columns</SelectItem>
                                <SelectItem value="3">3 Columns</SelectItem>
                                <SelectItem value="4">4 Columns</SelectItem>
                                <SelectItem value="6">6 Columns</SelectItem>
                                <SelectItem value="12">12 Columns</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {selectedComponent.type === "flex" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="flexDirection">Direction</Label>
                              <Select
                                value={selectedComponent.props.direction || "row"}
                                onValueChange={(value) => handlePropertyChange("direction", value)}
                              >
                                <SelectTrigger id="flexDirection">
                                  <SelectValue placeholder="Select direction" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="row">Row</SelectItem>
                                  <SelectItem value="column">Column</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="flexJustify">Justify Content</Label>
                              <Select
                                value={selectedComponent.props.justify || "between"}
                                onValueChange={(value) => handlePropertyChange("justify", value)}
                              >
                                <SelectTrigger id="flexJustify">
                                  <SelectValue placeholder="Select justify content" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="start">Start</SelectItem>
                                  <SelectItem value="end">End</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="between">Space Between</SelectItem>
                                  <SelectItem value="around">Space Around</SelectItem>
                                  <SelectItem value="evenly">Space Evenly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="flexAlign">Align Items</Label>
                              <Select
                                value={selectedComponent.props.align || "center"}
                                onValueChange={(value) => handlePropertyChange("align", value)}
                              >
                                <SelectTrigger id="flexAlign">
                                  <SelectValue placeholder="Select align items" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="start">Start</SelectItem>
                                  <SelectItem value="end">End</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="stretch">Stretch</SelectItem>
                                  <SelectItem value="baseline">Baseline</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="flexWrap"
                                checked={selectedComponent.props.wrap}
                                onCheckedChange={(checked) => handlePropertyChange("wrap", checked)}
                              />
                              <Label htmlFor="flexWrap">Wrap</Label>
                            </div>
                          </>
                        )}

                        {["grid", "flex", "row", "column"].includes(selectedComponent.type) && (
                          <div className="space-y-2">
                            <Label htmlFor="layoutGap">Gap</Label>
                            <Select
                              value={selectedComponent.props.gap?.toString() || "4"}
                              onValueChange={(value) => handlePropertyChange("gap", Number.parseInt(value))}
                            >
                              <SelectTrigger id="layoutGap">
                                <SelectValue placeholder="Select gap" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                <SelectItem value="1">Extra Small</SelectItem>
                                <SelectItem value="2">Small</SelectItem>
                                <SelectItem value="4">Medium</SelectItem>
                                <SelectItem value="6">Large</SelectItem>
                                <SelectItem value="8">Extra Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </TabsContent>
                    )}

                    {/* Advanced tab content */}
                    <TabsContent value="advanced" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="customProps">Custom Properties (JSON)</Label>
                          <AdvancedPropsExamples />
                        </div>
                        <CodeEditor
                          value={selectedComponent.props.customProps || ""}
                          onChange={(value) => handlePropertyChange("customProps", value)}
                          placeholder='{ "data-testid": "my-input" }'
                          height="150px"
                        />
                        <p className="text-xs text-muted-foreground">
                          Add custom properties to the component in JSON format.
                        </p>
                      </div>
                    </TabsContent>

                    {/* Conditions tab content */}
                    <TabsContent value="conditions" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Show this component when:</Label>
                          <div className="flex items-center gap-2">
                            <ConditionsExamples />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const updatedComponent = {
                                  ...selectedComponent,
                                  conditions: [
                                    ...(selectedComponent.conditions || []),
                                    { field: "", operator: "equals", value: "" },
                                  ],
                                }
                                onUpdateComponent(updatedComponent)
                              }}
                              className="h-8 px-2"
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add Condition
                            </Button>
                          </div>
                        </div>

                        {(!selectedComponent.conditions || selectedComponent.conditions.length === 0) && (
                          <div className="text-sm text-muted-foreground">
                            No conditions set. This component will always be visible.
                          </div>
                        )}

                        {selectedComponent.conditions &&
                          selectedComponent.conditions.map((condition, index) => (
                            <div key={index} className="space-y-2 p-3 border rounded-md">
                              <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-5">
                                  <Label htmlFor={`condition-field-${index}`} className="text-xs">
                                    Field <span className="text-destructive">*</span>
                                  </Label>
                                  <Select
                                    value={condition.field}
                                    onValueChange={(value) => {
                                      if (!value.trim()) return // Prevent empty values

                                      const updatedConditions = [...(selectedComponent.conditions || [])]
                                      updatedConditions[index] = { ...condition, field: value }

                                      const updatedComponent = {
                                        ...selectedComponent,
                                        conditions: updatedConditions,
                                      }
                                      onUpdateComponent(updatedComponent)
                                    }}
                                  >
                                    <SelectTrigger id={`condition-field-${index}`} className="w-full" required>
                                      <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-50 max-h-[200px] overflow-y-auto">
                                      {getAllFieldNames().map((fieldName) => (
                                        <SelectItem key={fieldName} value={fieldName}>
                                          {fieldName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="col-span-4">
                                  <Label htmlFor={`condition-operator-${index}`} className="text-xs">
                                    Operator
                                  </Label>
                                  <Select
                                    value={condition.operator}
                                    onValueChange={(value: OperatorType) => {
                                      const updatedConditions = [...(selectedComponent.conditions || [])]
                                      updatedConditions[index] = {
                                        ...condition,
                                        operator: value,
                                        value:
                                          value === "isEmpty" || value === "isNotEmpty" ? undefined : condition.value,
                                      }

                                      const updatedComponent = {
                                        ...selectedComponent,
                                        conditions: updatedConditions,
                                      }
                                      onUpdateComponent(updatedComponent)
                                    }}
                                  >
                                    <SelectTrigger id={`condition-operator-${index}`} className="w-full">
                                      <SelectValue placeholder="Operator" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-50">
                                      <SelectItem value="equals">Equals</SelectItem>
                                      <SelectItem value="notEquals">Not Equals</SelectItem>
                                      <SelectItem value="contains">Contains</SelectItem>
                                      <SelectItem value="notContains">Not Contains</SelectItem>
                                      <SelectItem value="isEmpty">Is Empty</SelectItem>
                                      <SelectItem value="isNotEmpty">Is Not Empty</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {condition.operator !== "isEmpty" && condition.operator !== "isNotEmpty" && (
                                  <div className="col-span-3">
                                    <Label htmlFor={`condition-value-${index}`} className="text-xs">
                                      Value
                                    </Label>
                                    {isBooleanField(condition.field, allComponents) ? (
                                      <Select
                                        value={
                                          condition.value === true || condition.value === "true" ? "true" : "false"
                                        }
                                        onValueChange={(value) => {
                                          const updatedConditions = [...(selectedComponent.conditions || [])]
                                          updatedConditions[index] = {
                                            ...condition,
                                            value: value === "true" ? true : false,
                                          }

                                          const updatedComponent = {
                                            ...selectedComponent,
                                            conditions: updatedConditions,
                                          }
                                          onUpdateComponent(updatedComponent)
                                        }}
                                      >
                                        <SelectTrigger id={`condition-value-${index}`} className="w-full">
                                          <SelectValue placeholder="Select value" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="z-50">
                                          <SelectItem value="true">True</SelectItem>
                                          <SelectItem value="false">False</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Input
                                        id={`condition-value-${index}`}
                                        value={condition.value || ""}
                                        onChange={(e) => {
                                          const updatedConditions = [...(selectedComponent.conditions || [])]
                                          updatedConditions[index] = { ...condition, value: e.target.value }

                                          const updatedComponent = {
                                            ...selectedComponent,
                                            conditions: updatedConditions,
                                          }
                                          onUpdateComponent(updatedComponent)
                                        }}
                                      />
                                    )}
                                  </div>
                                )}

                                <div className="flex items-end">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      const updatedConditions = [...(selectedComponent.conditions || [])]
                                      updatedConditions.splice(index, 1)

                                      const updatedComponent = {
                                        ...selectedComponent,
                                        conditions: updatedConditions,
                                      }
                                      onUpdateComponent(updatedComponent)
                                    }}
                                    className="h-8 w-8"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}

                        {selectedComponent.conditions && selectedComponent.conditions.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            All conditions must be met for the component to be visible.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </div>

          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button variant="outline" onClick={() => onUpdateComponent(null)}>
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

