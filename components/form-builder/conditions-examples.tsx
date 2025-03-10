"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Simple syntax highlighting component
function SyntaxHighlighter({ code }: { code: string }) {
  // Highlight TypeScript keywords
  const highlightedCode = code
    .replace(
      /(string|number|boolean|true|false|null|undefined|Record|any|void|return|if|else|try|catch|const|let|new)/g,
      '<span class="text-blue-500">$1</span>',
    )
    .replace(/(@param|@returns)/g, '<span class="text-green-600">$1</span>')
    .replace(/(\/\*\*|\*\/|\*)/g, '<span class="text-gray-400">$1</span>')
    .replace(/('.*?'|".*?")/g, '<span class="text-amber-600">$1</span>')
    .replace(/(===|!==|==|!=|=>|:)/g, '<span class="text-purple-500">$1</span>')

  return (
    <pre
      className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  )
}

const examples = [
  {
    name: "Show Based on Checkbox",
    description: "Show a component when a checkbox is checked",
    code: `// Condition configuration:
{
  field: "acceptTerms",  // The name of the checkbox field
  operator: "equals",
  value: true
}

// This will show the component only when the "acceptTerms" checkbox is checked`,
  },
  {
    name: "Hide Based on Selection",
    description: "Hide a component when a specific option is selected",
    code: `// Condition configuration:
{
  field: "paymentMethod",  // The name of the select field
  operator: "notEquals",
  value: "creditCard"
}

// This will hide the component when "creditCard" is selected in the paymentMethod field`,
  },
  {
    name: "Show When Field Has Value",
    description: "Show a component only when another field has a value",
    code: `// Condition configuration:
{
  field: "email",  // The name of the email field
  operator: "isNotEmpty"
}

// This will show the component only when the email field has a value`,
  },
  {
    name: "Show Based on Text Content",
    description: "Show a component when another field contains specific text",
    code: `// Condition configuration:
{
  field: "address",  // The name of the address field
  operator: "contains",
  value: "New York"
}

// This will show the component only when the address field contains "New York"`,
  },
  {
    name: "Multiple Conditions",
    description: "Using multiple conditions together (all must be true)",
    code: `// First condition:
{
  field: "userType",
  operator: "equals",
  value: "business"
}

// Second condition:
{
  field: "employees",
  operator: "isNotEmpty"
}

// Both conditions must be met for the component to be visible
// The component will only show when userType is "business" AND employees field has a value`,
  },
]

export function ConditionsExamples() {
  const [activeTab, setActiveTab] = useState("show-checkbox")
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (code: string, name: string) => {
    navigator.clipboard.writeText(code)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-3">
          Examples
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Condition Examples</DialogTitle>
          <DialogDescription>Copy these examples to use in your component conditions</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <Tabs
            defaultValue="show-checkbox"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="show-checkbox">Show/Hide</TabsTrigger>
              <TabsTrigger value="text-content">Text Content</TabsTrigger>
              <TabsTrigger value="multiple">Multiple</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-hidden">
              <TabsContent value="show-checkbox" className="h-full overflow-auto">
                <div className="space-y-4 pr-2">
                  {examples.slice(0, 2).map((example) => (
                    <div key={example.name} className="relative">
                      <h3 className="font-medium mb-1 pr-10">{example.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{example.description}</p>
                      <SyntaxHighlighter code={example.code} />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => copyToClipboard(example.code, example.name)}
                      >
                        {copied === example.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="text-content" className="h-full overflow-auto">
                <div className="space-y-4 pr-2">
                  {examples.slice(2, 4).map((example) => (
                    <div key={example.name} className="relative">
                      <h3 className="font-medium mb-1 pr-10">{example.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{example.description}</p>
                      <SyntaxHighlighter code={example.code} />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => copyToClipboard(example.code, example.name)}
                      >
                        {copied === example.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="multiple" className="h-full overflow-auto">
                <div className="relative">
                  <h3 className="font-medium mb-1 pr-10">{examples[4].name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{examples[4].description}</p>
                  <SyntaxHighlighter code={examples[4].code} />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => copyToClipboard(examples[4].code, examples[4].name)}
                  >
                    {copied === examples[4].name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

