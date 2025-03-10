import FormBuilder from "@/components/form-builder/form-builder"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Form Builder</h1>
      <FormBuilder />
      <Toaster />
    </main>
  )
}

