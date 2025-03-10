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
      /(string|number|boolean|true|Date|Record|any|void|return|if|try|catch|const|let|new)/g,
      '<span class="text-blue-500">$1</span>',
    )
    .replace(/(@param|@returns)/g, '<span class="text-green-600">$1</span>')
    .replace(/(\/\*\*|\*\/|\*)/g, '<span class="text-gray-400">$1</span>')
    .replace(/('.*?'|".*?")/g, '<span class="text-amber-600">$1</span>')
    .replace(/($$|$$|=>|:)/g, '<span class="text-purple-500">$1</span>')

  return (
    <pre
      className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  )
}

const examples = [
  {
    name: "Email Domain",
    description: "Validate that an email belongs to a specific domain",
    code: `/**
 * @param value - The email string to validate
 * @returns true if valid or an error message string
 */
(value: string): true | string => {
  if (!value) return true
  return value.endsWith('@company.com') ? true : 'Email must be a company email'
}`,
  },
  {
    name: "Password Strength",
    description: "Check if a password meets complexity requirements",
    code: `/**
 * @param value - The password string to validate
 * @returns true if valid or an error message string
 */
(value: string): true | string => {
  if (!value) return true
  const hasUppercase = /[A-Z]/.test(value)
  const hasLowercase = /[a-z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
  
  if (hasUppercase && hasLowercase && hasNumber && hasSpecial) {
    return true
  }
  return 'Password must include uppercase, lowercase, number, and special character'
}`,
  },
  {
    name: "URL Format",
    description: "Validate that a string is a valid URL",
    code: `/**
 * @param value - The URL string to validate
 * @returns true if valid or an error message string
 */
(value: string): true | string => {
  if (!value) return true
  try {
    new URL(value)
    return true
  } catch (e) {
    return 'Please enter a valid URL'
  }
}`,
  },
  {
    name: "Date Range",
    description: "Check if a date is within a specific range",
    code: `/**
 * @param value - The Date object to validate
 * @returns true if valid or an error message string
 */
(value: Date): true | string => {
  if (!value) return true
  const minDate = new Date('2023-01-01')
  const maxDate = new Date('2023-12-31')
  
  if (value < minDate) {
    return 'Date must be after January 1, 2023'
  }
  if (value > maxDate) {
    return 'Date must be before December 31, 2023'
  }
  return true
}`,
  },
  {
    name: "Matching Fields",
    description: "Check if a field matches another field (for password confirmation)",
    code: `/**
 * @param value - The confirmation value to check
 * @param formValues - Object containing all form values
 * @returns true if valid or an error message string
 */
(value: string, formValues: Record<string, any>): true | string => {
  if (!value) return true
  return value === formValues.password ? true : 'Passwords do not match'
}`,
  },
]

export function ValidationExamples() {
  const [activeTab, setActiveTab] = useState("email-domain")
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
          <DialogTitle>Validation Examples</DialogTitle>
          <DialogDescription>Copy these examples to use in your custom validation</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <Tabs
            defaultValue="email-domain"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="email-domain">Email</TabsTrigger>
              <TabsTrigger value="password-strength">Password</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-hidden">
              <TabsContent value="email-domain" className="h-full overflow-auto">
                <div className="relative">
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
              <TabsContent value="password-strength" className="h-full overflow-auto">
                <div className="relative">
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
              <TabsContent value="other" className="h-full overflow-auto">
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

