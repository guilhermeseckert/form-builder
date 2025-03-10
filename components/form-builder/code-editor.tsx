"use client"

import { useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { autocompletion } from "@codemirror/autocomplete"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
  className?: string
}

export function CodeEditor({ value, onChange, placeholder, height = "200px", className = "" }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // JavaScript/TypeScript specific completions
    const jsCompletions = [
      { label: "value", type: "variable", info: "The current field value" },
      { label: "return", type: "keyword" },
      { label: "if", type: "keyword" },
      { label: "else", type: "keyword" },
      { label: "true", type: "keyword" },
      { label: "false", type: "keyword" },
      { label: "null", type: "keyword" },
      { label: "undefined", type: "keyword" },
      { label: "function", type: "keyword" },
      { label: "const", type: "keyword" },
      { label: "let", type: "keyword" },
      { label: "var", type: "keyword" },
      { label: "String", type: "class", info: "String object" },
      { label: "Number", type: "class", info: "Number object" },
      { label: "Boolean", type: "class", info: "Boolean object" },
      { label: "Array", type: "class", info: "Array object" },
      { label: "Object", type: "class", info: "Object constructor" },
      { label: "RegExp", type: "class", info: "Regular expression constructor" },
      { label: "Date", type: "class", info: "Date object" },
      { label: "Math", type: "namespace", info: "Math object" },
      { label: "JSON", type: "namespace", info: "JSON object" },
      { label: "console", type: "namespace", info: "Console object" },
      { label: "console.log", type: "function", info: "Log to console" },
      { label: "parseInt", type: "function", info: "Parse string to integer" },
      { label: "parseFloat", type: "function", info: "Parse string to float" },
    ]

    // Validation function template completions
    const validationTemplates = [
      {
        label: "Basic validation",
        type: "function",
        info: "Basic validation function template",
        apply: "(value) => {\n  // Your validation logic here\n  return value ? true : 'Error message';\n}",
      },
      {
        label: "Email validation",
        type: "function",
        info: "Email validation function",
        apply:
          "(value) => {\n  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  return emailRegex.test(value) ? true : 'Please enter a valid email address';\n}",
      },
      {
        label: "Number range validation",
        type: "function",
        info: "Number range validation function",
        apply:
          "(value) => {\n  const num = Number(value);\n  return (num >= 1 && num <= 100) ? true : 'Value must be between 1 and 100';\n}",
      },
      {
        label: "Required validation",
        type: "function",
        info: "Required field validation",
        apply: "(value) => {\n  return value && value.trim() !== '' ? true : 'This field is required';\n}",
      },
      {
        label: "URL validation",
        type: "function",
        info: "URL validation function",
        apply:
          "(value) => {\n  try {\n    new URL(value);\n    return true;\n  } catch (e) {\n    return 'Please enter a valid URL';\n  }\n}",
      },
      {
        label: "Password strength",
        type: "function",
        info: "Password strength validation",
        apply:
          "(value) => {\n  if (value.length < 8) return 'Password must be at least 8 characters';\n  if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';\n  if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';\n  if (!/[0-9]/.test(value)) return 'Password must contain a number';\n  if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain a special character';\n  return true;\n}",
      },
      {
        label: "Date validation",
        type: "function",
        info: "Date validation function",
        apply:
          "(value) => {\n  const date = new Date(value);\n  return !isNaN(date.getTime()) ? true : 'Please enter a valid date';\n}",
      },
    ]

    // Custom completions provider
    const customCompletions = (context: any) => {
      const word = context.matchBefore(/\w*/)
      if (word.from === word.to && !context.explicit) return null

      return {
        from: word.from,
        options: [...jsCompletions, ...validationTemplates],
      }
    }

    // Create editor
    const view = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        javascript({ typescript: true }),
        autocompletion({ override: [customCompletions] }),
        vscodeDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          "&": {
            height,
            fontSize: "14px",
            borderRadius: "0.375rem",
            border: "1px solid hsl(var(--input))",
          },
          ".cm-scroller": {
            fontFamily: "monospace",
          },
          "&.cm-focused": {
            outline: "2px solid hsl(var(--ring))",
            outlineOffset: "1px",
          },
          ".cm-gutters": {
            backgroundColor: "hsl(var(--muted))",
            color: "hsl(var(--muted-foreground))",
            border: "none",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "hsl(var(--accent))",
          },
        }),
      ],
      parent: editorRef.current,
    })

    editorViewRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorViewRef.current && value !== editorViewRef.current.state.doc.toString()) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: value,
        },
      })
    }
  }, [value])

  return (
    <div ref={editorRef} className={`border rounded-md overflow-hidden ${className}`} data-placeholder={placeholder} />
  )
}

