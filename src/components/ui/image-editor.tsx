"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { X, RotateCw, ZoomIn, ZoomOut, Check, Crop, Move } from "lucide-react"

interface ImageEditorProps {
  image: string
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
  aspect?: number
  title?: string
}

interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

interface Point {
  x: number
  y: number
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossorigin", "anonymous")
    image.src = url
  })
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  )

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("Canvas is empty"))
      }
    }, "image/jpeg", 0.95)
  })
}

export default function ImageEditor({
  image,
  onCropComplete,
  onCancel,
  aspect = 1,
  title = "تعديل الصورة"
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(aspect)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (_: any, croppedAreaPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleCrop = async () => {
    if (!croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
      onCropComplete(croppedImage)
    } catch (e) {
      console.error("Crop failed:", e)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Crop className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative h-96 bg-gray-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            cropShape="rect"
            showGrid={true}
            style={{
              containerStyle: {
                width: "100%",
                height: "100%",
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 space-y-4">
          {/* Zoom */}
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5 text-gray-500 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <ZoomIn className="w-5 h-5 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-500 w-12 text-center">{zoom.toFixed(1)}x</span>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-4">
            <RotateCw className="w-5 h-5 text-gray-500 shrink-0" />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-gray-500 w-12 text-center">{rotation}°</span>
          </div>

          {/* Aspect Ratio */}
          <div className="flex items-center gap-2">
            <Move className="w-5 h-5 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-500 ml-2">النسبة:</span>
            {[
              { label: "1:1", value: 1 },
              { label: "4:3", value: 4 / 3 },
              { label: "16:9", value: 16 / 9 },
              { label: "حرية", value: undefined },
            ].map((ratio) => (
              <button
                key={ratio.label}
                onClick={() => setAspectRatio(ratio.value)}
                className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                  aspectRatio === ratio.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={handleCrop}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                تطبيق القص
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
