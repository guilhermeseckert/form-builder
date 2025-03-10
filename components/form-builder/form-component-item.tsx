"use client"

import { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Grip, X, Plus, Edit } from "lucide-react"

import { cn } from "@/lib/utils"
import type { FormComponent } from "./types"
import { renderFormComponent } from "./form-components-renderer"
import FormCanvas from "./form-canvas"
import { Button } from "@/components/ui/button"

interface FormComponentItemProps {
  component: FormComponent
  index: number
  onSelect: (componentId?: string) => void
  onRemove: () => void
  onMoveComponent: (dragIndex: number, hoverIndex: number) => void
  onAddComponent: (component: FormComponent, parentId?: string) => void
  isSelected: boolean
  onRemoveComponent: (componentId: string) => void
  parentId?: string
}

export default function FormComponentItem({
  component,
  index,
  onSelect,
  onRemove,
  onMoveComponent,
  onAddComponent,
  isSelected,
  onRemoveComponent,
  parentId,
}: FormComponentItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  // This is the drop target configuration
  const [{ handlerId, isOver }, drop] = useDrop({
    accept: "COMPONENT_ITEM",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver({ shallow: true }),
      }
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return
      }

      // Only handle items from the same parent
      if (item.parentId !== parentId) {
        return
      }

      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Get the bounding rectangle of the hover target
      const hoverBoundingRect = ref.current.getBoundingClientRect()

      // Get the middle Y position
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Get the mouse position
      const clientOffset = monitor.getClientOffset()

      if (!clientOffset) {
        return
      }

      // Get the pixel distance from the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the item's height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      onMoveComponent(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  // This is the drag source configuration
  const [{ isDragging }, drag, preview] = useDrag({
    type: "COMPONENT_ITEM",
    item: () => {
      return {
        id: component.id,
        index,
        parentId,
        originalIndex: index,
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        // If the item was not dropped on a valid target
      }
    },
  })

  // For layout components that can accept drops
  const [{ isLayoutOver, canDrop }, layoutDrop] = useDrop({
    accept: "FORM_COMPONENT",
    drop: (item: FormComponent, monitor) => {
      // Only handle drop if this component is the immediate target
      if (monitor.isOver({ shallow: true })) {
        console.log(`Dropping new component into layout ${component.id}`)
        onAddComponent(item, component.id)
        return { name: "LayoutComponent", parentId: component.id }
      }
      return undefined
    },
    canDrop: () => ["grid", "flex", "row", "column", "section", "dynamicList"].includes(component.type),
    collect: (monitor) => ({
      isLayoutOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  })

  // Combine drag and drop refs
  const dragDropRef = (node: HTMLDivElement) => {
    drag(node)
    drop(node)
    ref.current = node
  }

  const layoutRef = (node: HTMLDivElement) => {
    if (["grid", "flex", "row", "column", "section", "dynamicList"].includes(component.type)) {
      layoutDrop(node)
    }
    return node
  }

  // Determine if this is a layout component
  const isLayoutComponent = ["grid", "flex", "row", "column", "section", "dynamicList"].includes(component.type)

  // Ensure component.children is always an array
  const safeChildren = Array.isArray(component.children) ? component.children : []

  return (
    <div
      ref={preview}
      className={cn(
        "border rounded-md p-4 relative",
        isSelected ? "border-primary ring-2 ring-primary ring-opacity-50" : "border-gray-200",
        isDragging ? "opacity-50" : "opacity-100",
        isOver ? "bg-blue-100" : "",
        isLayoutComponent && isLayoutOver && canDrop ? "bg-primary/10" : "",
      )}
      data-handler-id={handlerId}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(component.id)
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <div
          ref={dragDropRef}
          className="cursor-move p-1 hover:bg-gray-100 rounded-md"
          onMouseDown={(e) => {
            // Prevent other events from interfering with drag start
            e.stopPropagation()
          }}
        >
          <Grip className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(component.id)
            }}
          >
            <Edit className="h-4 w-4 text-gray-400" />
          </Button>

          {isLayoutComponent && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </Button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Render the component */}
      <div>{renderFormComponent(component)}</div>

      {/* If this is a layout component, render its children */}
      {isLayoutComponent && (
        <div
          ref={layoutRef}
          className={`mt-4 p-2 border-2 ${isLayoutOver && canDrop ? "border-primary border-dashed bg-primary/5" : "border-dashed border-gray-200"} rounded-md min-h-[100px]`}
        >
          {safeChildren.length > 0 ? (
            <FormCanvas
              components={safeChildren}
              onSelectComponent={(childComponent) => {
                // When a child component is selected, pass its ID to onSelect
                if (typeof childComponent === "string") {
                  onSelect(childComponent)
                } else {
                  onSelect(childComponent.id)
                }
              }}
              onRemoveComponent={onRemoveComponent}
              onMoveComponent={onMoveComponent}
              onAddComponent={onAddComponent}
              selectedComponentId={isSelected ? component.id : undefined}
              parentId={component.id}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-center text-gray-500 p-4">
              Drag components here
            </div>
          )}
        </div>
      )}
    </div>
  )
}

