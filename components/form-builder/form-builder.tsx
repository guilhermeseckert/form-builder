"use client"

import React from "react"

import { useState, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Upload, Download } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

import ComponentPalette from "./component-palette"
import FormCanvas from "./form-canvas"
import PropertiesPanel from "./properties-panel"
import FormPreview from "./form-preview"
import { generateZodSchema, generateFormCode } from "./schema-generator"
import type { FormComponent, FormConfiguration } from "./types"

export default function FormBuilder() {
  const [formComponents, setFormComponents] = useState<FormComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<FormComponent | null>(null)
  const [formName, setFormName] = useState("MyForm")
  const [activeTab, setActiveTab] = useState("builder")
  const [generatedSchema, setGeneratedSchema] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [exportedJson, setExportedJson] = useState("")
  const [importJson, setImportJson] = useState("")
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleAddComponent = (component: FormComponent, parentId?: string) => {
    // Generate a unique ID for the component
    const newId = `${component.type}_${crypto.randomUUID()}`

    // Generate a unique name based on the type and current count of that type
    const typeCount = getAllComponents(formComponents).filter((c) => c.type === component.type).length + 1
    const newName = `${component.type}${typeCount}`

    const newComponent = {
      ...component,
      id: newId,
      name: newName,
      parentId: parentId,
      children: Array.isArray(component.children)
        ? component.children.map((child) => ({
            ...child,
            id: `${child.type}_${crypto.randomUUID()}`,
            parentId: newId,
          }))
        : [],
    }

    // If adding to a parent component
    if (parentId) {
      setFormComponents((prevComponents) => {
        return addComponentToParent(prevComponents, parentId, newComponent)
      })
    } else {
      // Add to root level
      setFormComponents((prevComponents) => [...prevComponents, newComponent])
    }

    // Select the newly added component
    setSelectedComponent(newComponent)
  }

  // Helper function to add a component to a parent
  const addComponentToParent = (
    components: FormComponent[],
    parentId: string,
    newComponent: FormComponent,
  ): FormComponent[] => {
    return components.map((component) => {
      if (component.id === parentId) {
        return {
          ...component,
          children: [...(component.children || []), newComponent],
        }
      } else if (component.children && component.children.length > 0) {
        return {
          ...component,
          children: addComponentToParent(component.children, parentId, newComponent),
        }
      }
      return component
    })
  }

  // Helper function to get all components (flattened)
  const getAllComponents = (components: FormComponent[]): FormComponent[] => {
    let allComponents: FormComponent[] = []

    for (const component of components) {
      allComponents.push(component)
      if (component.children && component.children.length > 0) {
        allComponents = [...allComponents, ...getAllComponents(component.children)]
      }
    }

    return allComponents
  }

  // Update the handleUpdateComponent function to handle null values properly
  const handleUpdateComponent = (updatedComponent: FormComponent | null) => {
    // If updatedComponent is null, just update the selectedComponent state
    if (!updatedComponent) {
      setSelectedComponent(null)
      return
    }

    setFormComponents((prevComponents) => updateComponentInTree(prevComponents, updatedComponent))
    setSelectedComponent(updatedComponent)
  }

  // Update the updateComponentInTree function to add a null check
  const updateComponentInTree = (components: FormComponent[], updatedComponent: FormComponent): FormComponent[] => {
    // Add a null check to ensure updatedComponent is not null
    if (!updatedComponent) return components

    return components.map((component) => {
      if (component.id === updatedComponent.id) {
        return updatedComponent
      } else if (component.children && component.children.length > 0) {
        return {
          ...component,
          children: updateComponentInTree(component.children, updatedComponent),
        }
      }
      return component
    })
  }

  const handleRemoveComponent = (id: string) => {
    // Log for debugging
    console.log("Removing component with ID:", id)

    setFormComponents((prevComponents) => removeComponentFromTree(prevComponents, id))
    if (selectedComponent?.id === id) {
      setSelectedComponent(null)
    }
  }

  // Helper function to remove a component from the tree
  const removeComponentFromTree = (components: FormComponent[], id: string): FormComponent[] => {
    // First check if the component is at this level
    const filteredComponents = components.filter((component) => component.id !== id)

    // If we removed something, return the filtered array
    if (filteredComponents.length < components.length) {
      return filteredComponents
    }

    // Otherwise, check children recursively
    return filteredComponents.map((component) => {
      if (component.children && component.children.length > 0) {
        return {
          ...component,
          children: removeComponentFromTree(component.children, id),
        }
      }
      return component
    })
  }

  // Update the handleMoveComponent function to properly handle reordering
  const handleMoveComponent = (dragIndex: number, hoverIndex: number, parentId?: string) => {
    console.log(`Moving component from ${dragIndex} to ${hoverIndex} in parent ${parentId || "root"}`)

    setFormComponents((prevComponents) => {
      try {
        // If we're moving within a parent component
        if (parentId) {
          return moveComponentInParent(prevComponents, parentId, dragIndex, hoverIndex)
        }
        // Moving at root level
        else {
          const newComponents = [...prevComponents]

          // Make sure the indices are valid
          if (
            dragIndex >= 0 &&
            dragIndex < newComponents.length &&
            hoverIndex >= 0 &&
            hoverIndex < newComponents.length
          ) {
            // Get the component being dragged
            const dragComponent = newComponents[dragIndex]

            // Remove it from its original position
            newComponents.splice(dragIndex, 1)

            // Insert it at the new position
            newComponents.splice(hoverIndex, 0, dragComponent)

            // Log the reordering for debugging
            console.log(`Reordered root components:`, newComponents.map((c) => c.id).join(", "))
          } else {
            console.warn(
              `Invalid indices for root reordering: dragIndex=${dragIndex}, hoverIndex=${hoverIndex}, componentsLength=${newComponents.length}`,
            )
          }

          return newComponents
        }
      } catch (error) {
        console.error("Error during component reordering:", error)
        return prevComponents // Return unchanged state on error
      }
    })
  }

  // Add this helper function to handle moving components within a parent
  const moveComponentInParent = (
    components: FormComponent[],
    parentId: string,
    dragIndex: number,
    hoverIndex: number,
  ): FormComponent[] => {
    return components.map((component) => {
      // If this is the parent component
      if (component.id === parentId && component.children) {
        try {
          const newChildren = [...component.children]

          // Make sure the indices are valid
          if (dragIndex >= 0 && dragIndex < newChildren.length && hoverIndex >= 0 && hoverIndex < newChildren.length) {
            // Get the component being dragged
            const dragComponent = newChildren[dragIndex]

            // Remove it from its original position
            newChildren.splice(dragIndex, 1)

            // Insert it at the new position
            newChildren.splice(hoverIndex, 0, dragComponent)

            // Log the reordering for debugging
            console.log(`Reordered children in ${parentId}:`, newChildren.map((c) => c.id).join(", "))
          } else {
            console.warn(
              `Invalid indices for reordering: dragIndex=${dragIndex}, hoverIndex=${hoverIndex}, childrenLength=${newChildren.length}`,
            )
          }

          return {
            ...component,
            children: newChildren,
          }
        } catch (error) {
          console.error(`Error reordering children in ${parentId}:`, error)
          return component // Return unchanged component on error
        }
      }
      // Check children recursively
      else if (component.children && component.children.length > 0) {
        return {
          ...component,
          children: moveComponentInParent(component.children, parentId, dragIndex, hoverIndex),
        }
      }
      return component
    })
  }

  // Add this function to initialize the form without the phone component
  const initializeWithoutPhone = () => {
    // Filter out any component with type "phone" or "phoneNumber"
    setFormComponents((prevComponents) => removePhoneComponentsFromTree(prevComponents))
  }

  // Helper function to recursively remove phone components
  const removePhoneComponentsFromTree = (components: FormComponent[]): FormComponent[] => {
    return components
      .filter((component) => component.type !== "phoneNumber")
      .map((component) => {
        if (component.children && component.children.length > 0) {
          return {
            ...component,
            children: removePhoneComponentsFromTree(component.children),
          }
        }
        return component
      })
  }

  // Call this function when the component mounts
  React.useEffect(() => {
    initializeWithoutPhone()
  }, [])

  const handleGenerateCode = () => {
    if (formComponents.length === 0) {
      toast({
        title: "No components",
        description: "Please add at least one component to generate code",
        variant: "destructive",
      })
      return
    }

    try {
      const schema = generateZodSchema(formComponents, formName)
      const code = generateFormCode(formComponents, formName)

      // Log to help debug
      console.log("Generated schema:", schema)
      console.log("Generated code:", code)

      setGeneratedSchema(schema)
      setGeneratedCode(code)
      setActiveTab("code")

      toast({
        title: "Code generated",
        description: "Zod schema and form component code have been generated successfully",
      })
    } catch (error) {
      console.error("Error generating code:", error)
      toast({
        title: "Error generating code",
        description: "An error occurred while generating the code. Please check the console for details.",
        variant: "destructive",
      })
    }
  }

  const handleExportForm = () => {
    const formConfig: FormConfiguration = {
      name: formName,
      components: formComponents,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
    }

    const jsonString = JSON.stringify(formConfig, null, 2)
    setExportedJson(jsonString)

    // Create a download link
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formName.replace(/\s+/g, "-").toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Form exported",
      description: "Your form has been exported as JSON",
    })
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportedJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Copied to clipboard",
      description: "The JSON configuration has been copied to your clipboard",
    })
  }

  const handleImportForm = () => {
    try {
      const formConfig: FormConfiguration = JSON.parse(importJson)

      if (!formConfig.components || !Array.isArray(formConfig.components)) {
        throw new Error("Invalid form configuration: missing or invalid components array")
      }

      setFormName(formConfig.name || "ImportedForm")
      setFormComponents(formConfig.components)
      setSelectedComponent(null)
      setImportJson("")

      toast({
        title: "Form imported",
        description: `Successfully imported form "${formConfig.name}" with ${formConfig.components.length} components`,
      })
    } catch (error) {
      console.error("Error importing form:", error)
      toast({
        title: "Import failed",
        description: "The JSON configuration is invalid. Please check the format and try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string
        const formConfig: FormConfiguration = JSON.parse(json)

        if (!formConfig.components || !Array.isArray(formConfig.components)) {
          throw new Error("Invalid form configuration: missing or invalid components array")
        }

        setFormName(formConfig.name || "ImportedForm")
        setFormComponents(formConfig.components)
        setSelectedComponent(null)

        toast({
          title: "Form imported",
          description: `Successfully imported form "${formConfig.name}" with ${formConfig.components.length} components`,
        })
      } catch (error) {
        console.error("Error importing form from file:", error)
        toast({
          title: "Import failed",
          description: "The file contains invalid JSON. Please check the format and try again.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSelectComponent = (component: FormComponent) => {
    // Ensure we're selecting the actual component, not a parent
    setSelectedComponent(component)

    // Log for debugging
    console.log("Selected component:", component.id, component.type, component.name)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Generated Code</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Form</DialogTitle>
                  <DialogDescription>Import a previously saved form configuration.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="json-import">Paste JSON Configuration</Label>
                    <Textarea
                      id="json-import"
                      placeholder='{"name": "MyForm", "components": [...]}'
                      value={importJson}
                      onChange={(e) => setImportJson(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="file-import">Import from File</Label>
                    <Input id="file-import" type="file" accept=".json" ref={fileInputRef} onChange={handleFileImport} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleImportForm} disabled={!importJson.trim()}>
                    Import
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={handleExportForm} disabled={formComponents.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <ComponentPalette onAddComponent={(component) => handleAddComponent(component)} />
            </div>

            <div className="md:col-span-9">
              <Card className="p-4">
                <h2 className="text-lg font-medium mb-2">Form Canvas</h2>
                <Separator className="mb-4" />
                <FormCanvas
                  components={formComponents}
                  onSelectComponent={handleSelectComponent}
                  onRemoveComponent={handleRemoveComponent}
                  onMoveComponent={handleMoveComponent}
                  onAddComponent={handleAddComponent}
                  selectedComponentId={selectedComponent?.id}
                />
                {formComponents.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-md p-8 text-center text-gray-500">
                    Drag components here to build your form
                  </div>
                )}
              </Card>
              <div className="mt-4 flex justify-end">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all components?")) {
                        setFormComponents([])
                        setSelectedComponent(null)
                      }
                    }}
                    disabled={formComponents.length === 0}
                  >
                    Clear All
                  </Button>
                  <Button onClick={handleGenerateCode} disabled={formComponents.length === 0}>
                    Generate Code
                  </Button>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <PropertiesPanel
                selectedComponent={selectedComponent}
                onUpdateComponent={handleUpdateComponent}
                formName={formName}
                onUpdateFormName={setFormName}
                allComponents={formComponents}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <FormPreview components={formComponents} formName={formName} />
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h2 className="text-lg font-medium mb-2">Zod Schema</h2>
              <Separator className="mb-4" />
              {generatedSchema ? (
                <Textarea className="font-mono h-[500px]" value={generatedSchema} readOnly />
              ) : (
                <div className="text-center text-gray-500 p-8">
                  No schema generated yet. Click "Generate Code" to create the schema.
                </div>
              )}
            </Card>
            <Card className="p-4">
              <h2 className="text-lg font-medium mb-2">Form Component</h2>
              <Separator className="mb-4" />
              {generatedCode ? (
                <Textarea className="font-mono h-[500px]" value={generatedCode} readOnly />
              ) : (
                <div className="text-center text-gray-500 p-8">
                  No component code generated yet. Click "Generate Code" to create the component.
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DndProvider>
  )
}

