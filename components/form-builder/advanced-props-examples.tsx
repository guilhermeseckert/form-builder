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
  // Highlight JSON syntax
  const highlightedCode = code
    .replace(/(true|false|null)/g, '<span class="text-blue-500">$1</span>')
    .replace(/(".*?"):/g, '<span class="text-green-600">$1</span>')
    .replace(/({|}|\[|\]|,)/g, '<span class="text-gray-400">$1</span>')
    .replace(/(".*?")/g, '<span class="text-amber-600">$1</span>')

  return (
    <pre
      className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  )
}

const examples = [
  {
    name: "Testing Attributes",
    description: "Add data attributes for testing",
    code: `{
  "data-testid": "email-input",
  "data-cy": "user-email",
  "aria-label": "Email Address"
}`,
  },
  {
    name: "Accessibility Properties",
    description: "Enhance accessibility with ARIA attributes",
    code: `{
  "aria-required": "true",
  "aria-describedby": "email-hint",
  "aria-invalid": "false"
}`,
  },
  {
    name: "Custom Styling",
    description: "Add custom styling classes or inline styles",
    code: `{
  "className": "custom-input special-field",
  "style": {
    "maxWidth": "400px",
    "backgroundColor": "var(--custom-bg)"
  }
}`,
  },
  {
    name: "Event Handlers",
    description: "Add custom event handlers (note: these will be stringified)",
    code: `{
  "onFocus": "() => console.log('Field focused')",
  "onBlur": "() => validateField()",
  "data-format": "currency"
}`,
  },
  {
    name: "Input Masks & Patterns",
    description: "Add input validation patterns and masks",
    code: `{
  "pattern": "[0-9]{5}(-[0-9]{4})?",
  "inputMode": "numeric",
  "autoComplete": "postal-code",
  "placeholder": "12345 or 12345-6789"
}`,
  },
]

export function AdvancedPropsExamples() {
  const [activeTab, setActiveTab] = useState("testing")
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
          <DialogTitle>Advanced Properties Examples</DialogTitle>
          <DialogDescription>Copy these examples to use in your custom properties</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="testing" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="testing" className="mt-2">
                <div className="relative">
                  <h3 className="font-medium mb-1 pr-10">{examples[0].name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{examples[0].description}</p>
                  <SyntaxHighlighter code={examples[0].code} />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => copyToClipboard(examples[0].code, examples[0].name)}
                  >
                    {copied === examples[0].name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="accessibility" className="mt-2">
                <div className="relative">
                  <h3 className="font-medium mb-1 pr-10">{examples[1].name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{examples[1].description}</p>
                  <SyntaxHighlighter code={examples[1].code} />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => copyToClipboard(examples[1].code, examples[1].name)}
                  >
                    {copied === examples[1].name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="other" className="mt-2">
                <div className="space-y-4 pr-2">
                  {examples.slice(2).map((example) => (
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
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

