"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { RichTextEditor } from "./rich-text-editor"
import { SignaturePad } from "./signature-pad"
import type { FormComponent } from "./types"

export function renderPreviewComponent(
  component: FormComponent,
  errors: Record<string, string>,
  formValues: Record<string, unknown>,
  handleFieldChange: (name: string, value: unknown) => void,
) {
  const { type, name, props, children } = component
  const error = errors[name]

  switch (type) {
    case "text":
    case "email":
    case "password":
    case "url":
    case "number":
    case "tel":
      return (
        <div className="space-y-2">
          <Label htmlFor={name} className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>
          <Input
            id={name}
            name={name}
            type={type}
            placeholder={props.placeholder as string}
            value={(formValues[name] as string) || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            required={props.required as boolean}
            min={props.min as number}
            max={props.max as number}
            minLength={props.minLength as number}
            maxLength={props.maxLength as number}
            className={cn(error && "border-red-500")}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "phoneNumber":
      return (
        <div className="space-y-2">
          <Label htmlFor={name} className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>
          <Input
            id={name}
            name={name}
            type="tel"
            placeholder={props.placeholder as string}
            value={(formValues[name] as string) || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            required={props.required as boolean}
            className={cn(error && "border-red-500")}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
          {props.format && <p className="text-xs text-muted-foreground">Format: {props.format as string}</p>}
        </div>
      )

    case "currency":
      return (
        <div className="space-y-2">
          <Label htmlFor={name} className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {props.currency === "USD"
                ? "$"
                : props.currency === "EUR"
                  ? "€"
                  : props.currency === "GBP"
                    ? "£"
                    : props.currency}
            </span>
            <Input
              id={name}
              name={name}
              type="text"
              placeholder={props.placeholder as string}
              value={(formValues[name] as string) || ""}
              onChange={(e) => {
                // Only allow numbers and decimal point
                const value = e.target.value.replace(/[^0-9.]/g, "")
                handleFieldChange(name, value)
              }}
              required={props.required as boolean}
              className={cn("pl-8", error && "border-red-500")}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "textarea":
      return (
        <div className="space-y-2">
          <Label htmlFor={name} className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>
          <Textarea
            id={name}
            name={name}
            placeholder={props.placeholder as string}
            value={(formValues[name] as string) || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            required={props.required as boolean}
            rows={props.rows as number}
            className={cn(error && "border-red-500")}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "select":
      return (
        <div className="space-y-2">
          <Label htmlFor={name} className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>
          <Select
            value={(formValues[name] as string) || ""}
            onValueChange={(value) => handleFieldChange(name, value)}
            required={props.required as boolean}
          >
            <SelectTrigger id={name} className={cn(error && "border-red-500")}>
              <SelectValue placeholder={props.placeholder as string} />
            </SelectTrigger>
            <SelectContent>
              {(props.options as { value: string; label: string }[]).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "checkbox":
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              name={name}
              checked={Boolean(formValues[name])}
              onCheckedChange={(checked) => handleFieldChange(name, checked)}
              required={props.required as boolean}
              className={cn(error && "border-red-500")}
            />
            <Label
              htmlFor={name}
              className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}
            >
              {props.label}
            </Label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "switch":
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              name={name}
              checked={Boolean(formValues[name])}
              onCheckedChange={(checked) => handleFieldChange(name, checked)}
              required={props.required as boolean}
              className={cn(error && "border-red-500")}
            />
            <Label
              htmlFor={name}
              className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}
            >
              {props.label}
            </Label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "radio":
      return (
        <div className="space-y-2">
          <Label className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>
          <RadioGroup
            value={(formValues[name] as string) || ""}
            onValueChange={(value) => handleFieldChange(name, value)}
            required={props.required as boolean}
            className={cn("space-y-1", error && "border-red-500")}
          >
            {(props.options as { value: string; label: string }[]).map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "date":
      return (
        <div className="space-y-2">
          <Label htmlFor={name} className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={name}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formValues[name] && "text-muted-foreground",
                  error && "border-red-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formValues[name] ? format(new Date(formValues[name] as string), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formValues[name] ? new Date(formValues[name] as string) : undefined}
                onSelect={(date) => handleFieldChange(name, date?.toISOString() || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "richtext":
      return (
        <div className="space-y-2">
          <Label htmlFor={name} className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>
          <RichTextEditor
            id={name}
            value={(formValues[name] as string) || (props.defaultValue as string) || ""}
            onChange={(value) => handleFieldChange(name, value)}
            placeholder={props.placeholder as string}
            editable={true}
            className={cn(error && "border-red-500")}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "signature":
      return (
        <div className="space-y-2">
          <Label htmlFor={name} className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>
          <SignaturePad
            id={name}
            width={props.width as number}
            height={props.height as number}
            value={formValues[name] as string}
            onChange={(value) => handleFieldChange(name, value)}
            disabled={false}
            className={cn(error && "border-red-500")}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "dynamicList":
      const listItems = (formValues[name] as unknown[]) || []
      const [showItemForm, setShowItemForm] = useState(false)
      const [currentItemValues, setCurrentItemValues] = useState<Record<string, unknown>>({})

      const handleAddItem = () => {
        const newItems = [...listItems, currentItemValues]
        handleFieldChange(name, newItems)
        setCurrentItemValues({})
        setShowItemForm(false)
      }

      const handleRemoveItem = (index: number) => {
        const newItems = [...listItems]
        newItems.splice(index, 1)
        handleFieldChange(name, newItems)
      }

      const handleItemFieldChange = (fieldName: string, value: unknown) => {
        setCurrentItemValues((prev) => ({
          ...prev,
          [fieldName]: value,
        }))
      }

      return (
        <div className="space-y-4">
          <Label className={cn(props.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {props.label}
          </Label>

          {listItems.length > 0 && (
            <div className="space-y-2">
              {listItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-1 border rounded-md p-3">
                    {Object.entries(item as Record<string, unknown>).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <span className="font-medium">{key}: </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="h-8 w-8 text-red-500"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showItemForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add New {props.itemLabel || "Item"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {children?.map((child) => {
                  // Create a temporary component with a unique name for the form
                  const tempComponent = {
                    ...child,
                    name: `temp_${child.name}`,
                  }
                  return (
                    <div key={child.id}>
                      {renderPreviewComponent(tempComponent, {}, currentItemValues, handleItemFieldChange)}
                    </div>
                  )
                })}
              </CardContent>
              <div className="flex justify-end space-x-2 p-4">
                <Button variant="outline" onClick={() => setShowItemForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add</Button>
              </div>
            </Card>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowItemForm(true)}
              disabled={(props.maxItems as number) > 0 && listItems.length >= (props.maxItems as number)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {props.addButtonText || "Add Item"}
            </Button>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-xs text-muted-foreground">
            {props.minItems && (props.minItems as number) > 0 ? `Minimum ${props.minItems} items required. ` : ""}
            {props.maxItems && (props.maxItems as number) > 0 ? `Maximum ${props.maxItems} items allowed.` : ""}
          </p>
          {props.helpText && <p className="text-sm text-muted-foreground">{props.helpText as string}</p>}
        </div>
      )

    case "grid":
      return (
        <div className="border p-2 rounded-md">
          <div className={`grid grid-cols-${props.columns || 2} gap-${props.gap || 4}`}>
            {children?.map((child) => (
              <div key={child.id}>{renderPreviewComponent(child, errors, formValues, handleFieldChange)}</div>
            ))}
          </div>
        </div>
      )

    case "flex":
      return (
        <div className="border p-2 rounded-md">
          <div
            className={`flex ${props.direction === "column" ? "flex-col" : "flex-row"} 
                      ${props.wrap ? "flex-wrap" : "flex-nowrap"} 
                      gap-${props.gap || 4} 
                      justify-${props.justify || "between"} 
                      items-${props.align || "center"}`}
          >
            {children?.map((child) => (
              <div key={child.id} className="flex-1">
                {renderPreviewComponent(child, errors, formValues, handleFieldChange)}
              </div>
            ))}
          </div>
        </div>
      )

    case "row":
      return (
        <div className={`flex flex-row gap-${props.gap || 4}`}>
          {children?.map((child) => (
            <div key={child.id} className="flex-1">
              {renderPreviewComponent(child, errors, formValues, handleFieldChange)}
            </div>
          ))}
        </div>
      )

    case "column":
      return (
        <div className={`flex flex-col gap-${props.gap || 4}`}>
          {children?.map((child) => (
            <div key={child.id}>{renderPreviewComponent(child, errors, formValues, handleFieldChange)}</div>
          ))}
        </div>
      )

    case "section":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{props.title || "Section Title"}</CardTitle>
            {props.description && <CardDescription>{props.description as string}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            {children?.map((child) => (
              <div key={child.id}>{renderPreviewComponent(child, errors, formValues, handleFieldChange)}</div>
            ))}
          </CardContent>
        </Card>
      )

    default:
      return <div>Unknown component type: {type}</div>
  }
}

