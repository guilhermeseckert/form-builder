"use client"

import { useDrop } from "react-dnd"
import type { FormComponent } from "./types"
import FormComponentItem from "./form-component-item"

interface FormCanvasProps {
  components: FormComponent[]
  onSelectComponent: (componentOrId: FormComponent | string) => void
  onRemoveComponent: (id: string) => void
  onMoveComponent: (dragIndex: number, hoverIndex: number, parentId?: string) => void
  onAddComponent: (component: FormComponent, parentId?: string) => void
  selectedComponentId?: string
  parentId?: string
}

export default function FormCanvas({
  components,
  onSelectComponent,
  onRemoveComponent,
  onMoveComponent,
  onAddComponent,
  selectedComponentId,
  parentId,
}: FormCanvasProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ["FORM_COMPONENT", "COMPONENT_ITEM"],
    drop: (item: unknown, monitor) => {
      // If this is the target (not a child target)
      if (monitor.isOver({ shallow: true })) {
        // If it's a new component being added (from the palette)
        if (item && typeof item === "object" && "type" in item) {
          onAddComponent(item as FormComponent, parentId)
          return { name: "FormCanvas", parentId }
        }
      }
      return undefined
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  })

  // Ensure components is always an array, even if it's undefined
  const safeComponents = Array.isArray(components) ? components : []

  // Handle component reordering within this canvas
  const handleMoveComponent = (dragIndex: number, hoverIndex: number) => {
    console.log(`Moving component from ${dragIndex} to ${hoverIndex} in parent ${parentId || "root"}`)
    onMoveComponent(dragIndex, hoverIndex, parentId)
  }

  return (
    <div
      ref={drop}
      className={`min-h-[100px] space-y-4 p-2 ${isOver && canDrop ? "bg-primary/5 border-2 border-dashed border-primary/40 rounded-md" : ""}`}
      data-testid="form-canvas"
    >
      {safeComponents.map((component, index) => (
        <FormComponentItem
          key={component.id}
          component={component}
          index={index}
          parentId={parentId}
          onSelect={(componentId) => {
            if (componentId) {
              // Find the component by ID
              const foundComponent = findComponentById(safeComponents, componentId)
              if (foundComponent) {
                onSelectComponent(foundComponent)
              } else {
                // If component not found in this level, just pass the ID up
                onSelectComponent(componentId)
              }
            } else {
              // Default to the current component
              onSelectComponent(component)
            }
          }}
          onRemove={() => onRemoveComponent(component.id)}
          onMoveComponent={handleMoveComponent}
          onAddComponent={onAddComponent}
          isSelected={component.id === selectedComponentId}
          onRemoveComponent={onRemoveComponent}
        />
      ))}
      {safeComponents.length === 0 && isOver && canDrop && (
        <div className="h-16 w-full flex items-center justify-center text-center text-primary border-2 border-dashed border-primary rounded-md">
          Drop here to add component
        </div>
      )}
    </div>
  )
}

// Helper function to find a component by ID recursively
function findComponentById(components: FormComponent[], id: string): FormComponent | null {
  for (const component of components) {
    if (component.id === id) {
      return component
    }
    if (component.children && component.children.length > 0) {
      const found = findComponentById(component.children, id)
      if (found) return found
    }
  }
  return null
}

