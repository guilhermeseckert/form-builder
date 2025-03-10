"use client"

import type * as React from "react"
import { useRef, useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SignaturePadProps {
  value?: string
  onChange?: (value: string) => void
  width?: number
  height?: number
  className?: string
  disabled?: boolean
}

export function SignaturePad({
  value,
  onChange,
  width = 300,
  height = 150,
  className,
  disabled = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Initialize canvas and load existing signature if available
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the actual width of the container
    const containerWidth = canvas.parentElement?.clientWidth || width

    // Set canvas resolution for better quality
    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Set canvas styling - use 100% width but keep the height fixed
    canvas.style.width = `100%`
    canvas.style.height = `${height}px`

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load existing signature if available
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, containerWidth, height)
        setHasSignature(true)
      }
      img.src = value
      img.crossOrigin = "anonymous"
    }
  }, [width, height, value])

  // Handle drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)

    // Get coordinates
    let x: number, y: number
    if ("touches" in e) {
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    // Start new path
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "black"
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get coordinates
    let x: number, y: number
    if ("touches" in e) {
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    // Draw line
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDrawing = () => {
    if (disabled) return

    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    // Save signature as data URL
    const dataUrl = canvas.toDataURL("image/png")
    onChange?.(dataUrl)
  }

  const clearSignature = () => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    setHasSignature(false)
    onChange?.("")
  }

  // Add resize handler to make canvas responsive
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const containerWidth = canvas.parentElement?.clientWidth || width
      const dpr = window.devicePixelRatio || 1

      // Save current drawing
      const currentDrawing = canvas.toDataURL("image/png")

      // Resize canvas
      canvas.width = containerWidth * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      // Restore drawing
      if (currentDrawing) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, containerWidth, height)
        }
        img.src = currentDrawing
        img.crossOrigin = "anonymous"
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [width, height])

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="relative border rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          className={cn("touch-none cursor-crosshair bg-white w-full", disabled && "cursor-not-allowed opacity-60")}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
        {!disabled && hasSignature && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/80 hover:bg-white/90"
            onClick={clearSignature}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear signature</span>
          </Button>
        )}
      </div>
      {!disabled && <p className="text-xs text-muted-foreground text-center">Sign above using mouse or touch</p>}
    </div>
  )
}

