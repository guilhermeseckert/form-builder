"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write something...",
  editable = true,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "min-h-[150px] p-3 focus:outline-none",
        placeholder,
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {editable && (
        <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="Heading"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <div className="ml-auto flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8 w-8"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8 w-8"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <EditorContent editor={editor} className="prose prose-sm max-w-none" />
    </div>
  )
}

export function RichTextContent({ content }: { content: string }) {
  return <div className="prose prose-sm max-w-none p-3" dangerouslySetInnerHTML={{ __html: content }} />
}

