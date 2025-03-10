"use client"

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
import { CalendarIcon, ListPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FormComponent } from "./types"
import { RichTextEditor } from "./rich-text-editor"
import { SignaturePad } from "./signature-pad"

export function renderFormComponent(component: FormComponent) {
  const { type, props, children } = component

  switch (type) {
    case "text":
    case "email":
    case "password":
    case "tel":
    case "number":
    case "url":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
          <Input type={type} placeholder={props.placeholder} disabled />
        </div>
      )

    case "phoneNumber":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
          <Input type="tel" placeholder={props.placeholder} disabled />
          <p className="text-xs text-muted-foreground">Format: {props.format}</p>
        </div>
      )

    case "currency":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
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
            <Input type="text" placeholder={props.placeholder} className="pl-8" disabled />
          </div>
        </div>
      )

    case "textarea":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
          <Textarea placeholder={props.placeholder} rows={props.rows} disabled />
        </div>
      )

    case "select":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option: { value: string; label: string }) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox disabled />
          <Label>{props.label}</Label>
        </div>
      )

    case "switch":
      return (
        <div className="flex items-center space-x-2">
          <Switch disabled />
          <Label>{props.label}</Label>
        </div>
      )

    case "radio":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
          <RadioGroup disabled>
            {props.options.map((option: { value: string; label: string }) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} />
                <Label>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )

    case "date":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal" disabled>
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Pick a date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" disabled />
            </PopoverContent>
          </Popover>
        </div>
      )

    case "richtext":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
          <RichTextEditor value={props.defaultValue} placeholder={props.placeholder} editable={false} />
        </div>
      )

    case "signature":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
          <SignaturePad width={props.width} height={props.height} disabled={true} />
        </div>
      )

    case "dynamicList":
      return (
        <div className="space-y-2">
          <Label>{props.label}</Label>
          <div className="border rounded-md p-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{props.itemLabel || "Item"} Template</p>
            </div>
            <div className="border border-dashed border-gray-200 rounded-md p-4">
              {children && children.length > 0 ? (
                children.map((child) => (
                  <div key={child.id} className="mb-4 last:mb-0">
                    {/* Child components are rendered by FormComponentItem */}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <ListPlus className="h-8 w-8 mb-2" />
                  <p>Drag components here to build your item template</p>
                  <p className="text-xs mt-1">Each item in the list will contain these components</p>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="sm" disabled>
                {props.addButtonText || "Add Item"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {props.minItems > 0 ? `Minimum ${props.minItems} items required. ` : ""}
              {props.maxItems > 0 ? `Maximum ${props.maxItems} items allowed.` : ""}
            </p>
          </div>
        </div>
      )

    case "grid":
      return (
        <div className="border p-2 rounded-md">
          <div className="text-sm font-medium mb-2">Grid Layout ({props.columns || 2} columns)</div>
          <div className={`grid grid-cols-${props.columns || 2} gap-${props.gap || 4}`}>
            {children && children.length > 0 ? (
              children.map((child) => (
                <div key={child.id} className="min-h-[50px]">
                  {/* Child components are rendered by FormComponentItem */}
                </div>
              ))
            ) : (
              <>
                <div className="min-h-[50px] border border-dashed border-gray-200 rounded-md"></div>
                <div className="min-h-[50px] border border-dashed border-gray-200 rounded-md"></div>
              </>
            )}
          </div>
        </div>
      )

    case "flex":
      return (
        <div className="border p-2 rounded-md">
          <div className="text-sm font-medium mb-2">Flex Container ({props.direction || "row"})</div>
          <div
            className={`flex ${props.direction === "column" ? "flex-col" : "flex-row"} 
                        ${props.wrap ? "flex-wrap" : "flex-nowrap"} 
                        gap-${props.gap || 4} 
                        justify-${props.justify || "between"} 
                        items-${props.align || "center"}`}
          >
            {children && children.length > 0 ? (
              children.map((child) => (
                <div key={child.id} className="min-h-[50px]">
                  {/* Child components are rendered by FormComponentItem */}
                </div>
              ))
            ) : (
              <>
                <div className="min-h-[50px] border border-dashed border-gray-200 rounded-md flex-1"></div>
                <div className="min-h-[50px] border border-dashed border-gray-200 rounded-md flex-1"></div>
              </>
            )}
          </div>
        </div>
      )

    case "row":
      return (
        <div className="border p-2 rounded-md">
          <div className="text-sm font-medium mb-2">Row</div>
          <div className={`flex flex-row gap-${props.gap || 4}`}>
            {children && children.length > 0 ? (
              children.map((child) => (
                <div key={child.id} className="min-h-[50px] flex-1">
                  {/* Child components are rendered by FormComponentItem */}
                </div>
              ))
            ) : (
              <>
                <div className="min-h-[50px] border border-dashed border-gray-200 rounded-md flex-1"></div>
                <div className="min-h-[50px] border border-dashed border-gray-200 rounded-md flex-1"></div>
              </>
            )}
          </div>
        </div>
      )

    case "column":
      return (
        <div className="border p-2 rounded-md">
          <div className="text-sm font-medium mb-2">Column</div>
          <div className={`flex flex-col gap-${props.gap || 4}`}>
            {children && children.length > 0 ? (
              children.map((child) => (
                <div key={child.id} className="min-h-[50px]">
                  {/* Child components are rendered by FormComponentItem */}
                </div>
              ))
            ) : (
              <>
                <div className="min-h-[50px] border border-dashed border-gray-200 rounded-md"></div>
                <div className="min-h-[50px] border border-dashed border-gray-200 rounded-md"></div>
              </>
            )}
          </div>
        </div>
      )

    case "section":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{props.title || "Section Title"}</CardTitle>
            {props.description && <CardDescription>{props.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            {children && children.length > 0 ? (
              children.map((child) => (
                <div key={child.id} className="mb-4 last:mb-0">
                  {/* Child components are rendered by FormComponentItem */}
                </div>
              ))
            ) : (
              <div className="min-h-[50px] border border-dashed border-gray-200 rounded-md"></div>
            )}
          </CardContent>
        </Card>
      )

    default:
      return <div>Unknown component type: {type}</div>
  }
}

