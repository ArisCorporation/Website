<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps<{
  imageUrl: string
  aspectRatio?: number // e.g., 1 for square, 16/9 for landscape
}>()

const emit = defineEmits(['cropped', 'cancel', 'close'])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const image = new Image()

const zoom = ref(1)
const offsetX = ref(0) // Pan X from center
const offsetY = ref(0) // Pan Y from center

const CROP_BOX_ASPECT_RATIO = props.aspectRatio || 1 // Default to square
const CROP_BOX_PERCENTAGE = 0.8 // Crop box uses 80% of the smaller canvas dimension
const MIN_PIXEL_OVERLAP = 0.0 // Ensure image is at least this many pixels larger than cropbox dimension

// For dragging/panning
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

onMounted(() => {
  // Ensure CORS is handled if images are from a different origin
  image.crossOrigin = 'anonymous'
  loadImage()

  // Add global mouseup listener to stop dragging if mouse is released outside canvas
  window.addEventListener('mouseup', endPanGlobal)
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', endPanGlobal)
})

watch(
  () => props.imageUrl,
  (newUrl) => {
    if (newUrl) {
      loadImage()
    }
  }
)

function loadImage() {
  image.onload = () => {
    resetTransformations()
    nextTick(drawImageOnCanvas) // Ensure canvas is ready
  }
  image.onerror = () => {
    console.error('Failed to load image for cropping.')
    emit('cancel') // Or handle error appropriately
  }
  image.src = props.imageUrl
}

function getCropBoxDimensions(canvas: HTMLCanvasElement): {
  width: number
  height: number
} {
  let cropWidth: number, cropHeight: number
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height

  if (canvasWidth / canvasHeight > CROP_BOX_ASPECT_RATIO) {
    cropHeight = canvasHeight * CROP_BOX_PERCENTAGE
    cropWidth = cropHeight * CROP_BOX_ASPECT_RATIO
  } else {
    cropWidth = canvasWidth * CROP_BOX_PERCENTAGE
    cropHeight = cropWidth / CROP_BOX_ASPECT_RATIO
  }
  return { width: cropWidth, height: cropHeight }
}

function clampOffsets() {
  const canvas = canvasRef.value
  if (!canvas || !image.complete || image.naturalWidth === 0 || zoom.value <= 0)
    return

  const cropBox = getCropBoxDimensions(canvas)

  // Max pan is half the difference between scaled image dimension and crop box dimension
  // If scaled image dimension is smaller or equal to crop box dimension, maxPan is 0.
  const maxPanX = Math.max(
    0,
    (image.naturalWidth * zoom.value - cropBox.width) / 2
  )
  const maxPanY = Math.max(
    0,
    (image.naturalHeight * zoom.value - cropBox.height) / 2
  )

  offsetX.value = Math.max(-maxPanX, Math.min(maxPanX, offsetX.value))
  offsetY.value = Math.max(-maxPanY, Math.min(maxPanY, offsetY.value))
}

function resetTransformations() {
  zoom.value = 1
  offsetX.value = 0
  offsetY.value = 0

  // Set initial zoom to fit image within crop box (either fit width or height)
  if (image.naturalWidth > 0 && image.naturalHeight > 0 && canvasRef.value) {
    const canvas = canvasRef.value
    const cropBox = getCropBoxDimensions(canvas)
    // Ensure the scaled image is at least MIN_PIXEL_OVERLAP larger than the crop box
    const zoomToCoverWidth =
      (cropBox.width + MIN_PIXEL_OVERLAP) / image.naturalWidth
    const zoomToCoverHeight =
      (cropBox.height + MIN_PIXEL_OVERLAP) / image.naturalHeight
    zoom.value = Math.max(zoomToCoverWidth, zoomToCoverHeight)
  } else {
    zoom.value = 1 // Fallback
  }
  clampOffsets() // Ensure initial offsets are valid with the new zoom
}

function drawImageOnCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !image.src || !image.complete || image.naturalWidth === 0)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Save context state
  ctx.save()

  // Translate to center of canvas, apply pan, then scale
  ctx.translate(
    canvas.width / 2 + offsetX.value,
    canvas.height / 2 + offsetY.value
  )
  ctx.scale(zoom.value, zoom.value)

  // Draw image centered
  ctx.drawImage(
    image,
    -image.naturalWidth / 2,
    -image.naturalHeight / 2,
    image.naturalWidth,
    image.naturalHeight
  )

  // Restore context state to draw overlay without transformations
  ctx.restore()

  drawCropBoxOverlay(ctx, canvas.width, canvas.height)
}

function drawCropBoxOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) {
  const canvas = canvasRef.value
  if (!canvas) return
  const cropBox = getCropBoxDimensions(canvas)

  const cropX = (canvas.width - cropBox.width) / 2
  const cropY = (canvas.height - cropBox.height) / 2

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.lineWidth = 2
  ctx.strokeRect(cropX, cropY, cropBox.width, cropBox.height)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, canvasWidth, cropY)
  ctx.fillRect(
    0,
    cropY + cropBox.height,
    canvasWidth,
    canvasHeight - (cropY + cropBox.height)
  )
  ctx.fillRect(0, cropY, cropX, cropBox.height)
  ctx.fillRect(
    cropX + cropBox.width,
    cropY,
    canvasWidth - (cropX + cropBox.width),
    cropBox.height
  )
}

function handleMouseDown(event: MouseEvent) {
  isDragging.value = true
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
  canvasRef.value?.style.setProperty('cursor', 'grabbing')
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value) return
  const dx = event.clientX - lastMouseX.value
  const dy = event.clientY - lastMouseY.value
  offsetX.value += dx
  offsetY.value += dy
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
  clampOffsets()
  drawImageOnCanvas()
}

function endPan() {
  if (isDragging.value) {
    isDragging.value = false
    canvasRef.value?.style.setProperty('cursor', 'grab')
  }
}
function endPanGlobal(event: MouseEvent) {
  // Handles mouse up outside canvas
  endPan()
}

function handleWheel(event: WheelEvent) {
  event.preventDefault()
  const canvas = canvasRef.value
  if (
    !canvas ||
    !image.complete ||
    image.naturalWidth === 0 ||
    image.naturalHeight === 0
  )
    return

  const cropBox = getCropBoxDimensions(canvas)

  const minAllowedZoom = Math.max(
    // Ensure the scaled image is at least MIN_PIXEL_OVERLAP larger
    (cropBox.width + MIN_PIXEL_OVERLAP) / image.naturalWidth,
    (cropBox.height + MIN_PIXEL_OVERLAP) / image.naturalHeight
  )

  const zoomFactor = 0.1
  const scale = event.deltaY < 0 ? 1 + zoomFactor : 1 - zoomFactor
  const calculatedNewZoom = zoom.value * scale

  const finalNewZoom = Math.max(minAllowedZoom, Math.min(calculatedNewZoom, 5)) // Max 5x zoom

  // Zoom towards mouse pointer
  const rect = canvas.getBoundingClientRect()
  const mouseX = event.clientX - rect.left // Mouse X relative to canvas
  const mouseY = event.clientY - rect.top // Mouse Y relative to canvas

  // Adjust offsetX and offsetY to keep the point under the mouse stationary
  offsetX.value =
    mouseX -
    canvas.width / 2 -
    ((mouseX - (canvas.width / 2 + offsetX.value)) / zoom.value) * finalNewZoom
  offsetY.value =
    mouseY -
    canvas.height / 2 -
    ((mouseY - (canvas.height / 2 + offsetY.value)) / zoom.value) * finalNewZoom

  zoom.value = finalNewZoom
  clampOffsets()
  drawImageOnCanvas()
}

function performCrop() {
  const canvas = canvasRef.value
  if (!canvas || !image.src || !image.complete || image.naturalWidth === 0)
    return

  // Determine visual crop box dimensions
  const cropBox = getCropBoxDimensions(canvas)
  const cropRectX = (canvas.width - cropBox.width) / 2
  const cropRectY = (canvas.height - cropBox.height) / 2

  // Calculate source region on the original image
  const sx =
    (cropRectX - (canvas.width / 2 + offsetX.value)) / zoom.value +
    image.naturalWidth / 2
  const sy =
    (cropRectY - (canvas.height / 2 + offsetY.value)) / zoom.value +
    image.naturalHeight / 2
  const sWidth = cropBox.width / zoom.value
  const sHeight = cropBox.height / zoom.value

  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = sWidth // Or a fixed output size like 200x200, then sWidth/sHeight are source
  outputCanvas.height = sHeight
  const outCtx = outputCanvas.getContext('2d')
  if (!outCtx) return

  outCtx.drawImage(
    image,
    sx,
    sy,
    sWidth,
    sHeight,
    0,
    0,
    outputCanvas.width,
    outputCanvas.height
  )

  outputCanvas.toBlob(
    (blob) => {
      if (blob) {
        emit('cropped', blob)
      } else {
        console.error('Failed to create blob from canvas.')
      }
    },
    'image/png',
    0.9
  ) // Adjust type and quality as needed
}
const test = ref(true)
</script>

<template>
  <UModal v-model:open="test" @close="emit('close')">
    <template #content>
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Crop Avatar
          </h3>
        </template>

        <canvas
          ref="canvasRef"
          width="400"
          height="300"
          class="border bg-gray-200 dark:bg-gray-700 rounded-md w-full"
          style="cursor: grab"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="endPan"
          @mouseleave="endPan"
          @wheel="handleWheel"
        />

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton color="gray" variant="ghost" @click="emit('cancel')">
              Cancel
            </UButton>
            <UButton @click="performCrop"> Crop & Save </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
