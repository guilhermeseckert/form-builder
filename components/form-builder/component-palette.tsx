"use client"

import type React from "react"

import { useDrag } from "react-dnd"
import {
  TextIcon,
  MailIcon,
  KeyIcon,
  PhoneIcon,
  HashIcon,
  LinkIcon,
  AlignJustify,
  ListIcon,
  CheckSquare,
  ToggleLeft,
  Radio,
  CalendarIcon,
  Type,
  PenIcon,
  DollarSign,
  ListPlus,
  LayoutGrid,
  LayoutIcon,
  Rows,
  Columns,
  Layers,
  Plus,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FormComponent, FieldType } from "./types"

interface ComponentPaletteProps {
  onAddComponent: (component: FormComponent) => void
}

interface DraggableComponentProps {
  type: FieldType
  label: string
  icon: React.ReactNode
  onAddComponent: (component: FormComponent) => void
}

function DraggableComponent({ type, label, icon, onAddComponent }: DraggableComponentProps) {
  const component = createDefaultComponent(type)
  const [{ isDragging }, drag] = useDrag({
    type: "FORM_COMPONENT",
    item: () => {
      return { ...component }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const handleClick = () => {
    onAddComponent(component)
  }

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-accent cursor-pointer transition-colors"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {icon}
      <span className="flex-1">{label}</span>
      <Plus className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

function createDefaultComponent(type: FieldType): FormComponent {
  const baseComponent: FormComponent = {
    id: `temp_${type}`,
    type,
    name: type,
    props: {
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
    },
  }

  switch (type) {
    case "text":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Enter text",
          minLength: 0,
          maxLength: 100,
        },
      }

    case "email":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Enter email address",
        },
      }

    case "password":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Enter password",
          minLength: 8,
        },
      }

    case "tel":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Enter phone number",
        },
      }

    case "phoneNumber":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Enter phone number",
          format: "(###) ###-####",
        },
      }

    case "number":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Enter number",
          min: 0,
          max: 100,
        },
      }

    case "url":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Enter URL",
        },
      }

    case "textarea":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Enter text",
          rows: 4,
        },
      }

    case "select":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Select an option",
          options: [
            { label: "Option 1", value: "option1" },
            { label: "Option 2", value: "option2" },
            { label: "Option 3", value: "option3" },
          ],
        },
      }

    case "checkbox":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          label: "Checkbox Label",
        },
      }

    case "switch":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          label: "Switch Label",
        },
      }

    case "radio":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          options: [
            { label: "Option 1", value: "option1" },
            { label: "Option 2", value: "option2" },
            { label: "Option 3", value: "option3" },
          ],
        },
      }

    case "date":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
        },
      }

    case "richtext":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "Enter rich text",
          defaultValue: "",
        },
      }

    case "signature":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          width: 400,
          height: 200,
        },
      }

    case "currency":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          placeholder: "0.00",
          currency: "USD",
        },
      }

    case "dynamicList":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          itemLabel: "Item",
          addButtonText: "Add Item",
          minItems: 0,
          maxItems: 0,
        },
        children: [],
      }

    case "grid":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          columns: 2,
          gap: 4,
        },
        children: [],
      }

    case "flex":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          direction: "row",
          wrap: false,
          gap: 4,
          justify: "between",
          align: "center",
        },
        children: [],
      }

    case "row":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          gap: 4,
        },
        children: [],
      }

    case "column":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          gap: 4,
        },
        children: [],
      }

    case "section":
      return {
        ...baseComponent,
        props: {
          ...baseComponent.props,
          title: "Section Title",
          description: "Section description goes here",
        },
        children: [],
      }

    default:
      return baseComponent
  }
}

export default function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Components</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="inputs">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="inputs" className="rounded-none data-[state=active]:border-b-2">
              Inputs
            </TabsTrigger>
            <TabsTrigger value="layout" className="rounded-none data-[state=active]:border-b-2">
              Layout
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <TabsContent value="inputs" className="p-4 pt-2">
              <div className="space-y-2">
                <DraggableComponent
                  type="text"
                  label="Text"
                  icon={<TextIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="email"
                  label="Email"
                  icon={<MailIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="password"
                  label="Password"
                  icon={<KeyIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="phoneNumber"
                  label="Phone Number"
                  icon={<PhoneIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="number"
                  label="Number"
                  icon={<HashIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="url"
                  label="URL"
                  icon={<LinkIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="textarea"
                  label="Textarea"
                  icon={<AlignJustify className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="select"
                  label="Select"
                  icon={<ListIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="checkbox"
                  label="Checkbox"
                  icon={<CheckSquare className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="switch"
                  label="Switch"
                  icon={<ToggleLeft className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="radio"
                  label="Radio Group"
                  icon={<Radio className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="date"
                  label="Date"
                  icon={<CalendarIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <Separator />
                <DraggableComponent
                  type="richtext"
                  label="Rich Text"
                  icon={<Type className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="signature"
                  label="Signature"
                  icon={<PenIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="currency"
                  label="Currency"
                  icon={<DollarSign className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="dynamicList"
                  label="Dynamic List"
                  icon={<ListPlus className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
              </div>
            </TabsContent>
            <TabsContent value="layout" className="p-4 pt-2">
              <div className="space-y-2">
                <DraggableComponent
                  type="grid"
                  label="Grid"
                  icon={<LayoutGrid className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="flex"
                  label="Flex Container"
                  icon={<LayoutIcon className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="row"
                  label="Row"
                  icon={<Rows className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="column"
                  label="Column"
                  icon={<Columns className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
                <DraggableComponent
                  type="section"
                  label="Section"
                  icon={<Layers className="h-4 w-4" />}
                  onAddComponent={onAddComponent}
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}

