<script lang="ts" setup>
import { useToast } from '#imports'

type BingoCell = {
  id: string
  label: string
  active: boolean
  isFree?: boolean
}

const boardSize = 5
const centerIndex = Math.floor((boardSize * boardSize) / 2)

definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'AMS Bingo',
  description:
    'Ein simples AMS Bingo für die ArisCorp Crew – markiere deine Highlights und feiere jedes Bingo.',
})

const toast = useToast()
const phrases: string[] = [
  'Nyx',
  'Castra',
  'Dynamic Server Meshing',
  'Hacking Gameplay',
  'Engineering',
  'Battlecruiser Concept',
  'Maelstrom',
  'Player to Player Trading',
  'Crafting',
  'Perseus',
  'FPS Scanning',
  'Kraken',
  'Terra',
  'Map Marker',
  'Inventory Rework',
  'New Quantum System',
  'New Flight-Ready Ship',
  'Base Building',
  'SQ42 Release Date',
  'Social System',
  'Control Surfaces',
  'Data Running',
  'Bounty Hunting V2',
  'Additional Hauling Gameplay',
]

function buildBoard(): BingoCell[] {
  const pool = [...phrases]
  const cells: BingoCell[] = []

  for (let index = 0; index < boardSize * boardSize; index++) {
    if (index === centerIndex) {
      cells.push({
        id: 'free-field',
        label: 'Technische Schwierigkeiten',
        active: true,
        isFree: true,
      })
      continue
    }

    if (!pool.length) {
      throw new Error('Nicht genug Einträge für das AMS Bingo definiert.')
    }

    const randomIndex = Math.floor(Math.random() * pool.length)
    const [label] = pool.splice(randomIndex, 1)

    cells.push({
      id: `${index}-${label}`,
      label,
      active: false,
    })
  }

  return cells
}

const board = ref<BingoCell[]>(buildBoard())
const isExporting = ref(false)
const showCelebration = ref(false)

function toggleCell(index: number) {
  const cell = board.value[index]
  if (!cell || cell.isFree) return

  cell.active = !cell.active
}

function shuffleBoard() {
  board.value = buildBoard()
}

function resetBoard() {
  board.value = board.value.map((cell) => ({
    ...cell,
    active: Boolean(cell.isFree),
  }))
}

const completedLines = computed<number[][]>(() => {
  const cells = board.value
  const lines: number[][] = []

  const lineIsComplete = (indices: number[]) =>
    indices.every((cellIndex) => cells[cellIndex]?.active)

  for (let row = 0; row < boardSize; row++) {
    const indices = Array.from(
      { length: boardSize },
      (_, column) => row * boardSize + column
    )
    if (lineIsComplete(indices)) lines.push(indices)
  }

  for (let column = 0; column < boardSize; column++) {
    const indices = Array.from(
      { length: boardSize },
      (_, row) => row * boardSize + column
    )
    if (lineIsComplete(indices)) lines.push(indices)
  }

  const diagonalA = Array.from(
    { length: boardSize },
    (_, step) => step * boardSize + step
  )
  if (lineIsComplete(diagonalA)) lines.push(diagonalA)

  const diagonalB = Array.from(
    { length: boardSize },
    (_, step) => (step + 1) * boardSize - (step + 1)
  )
  if (lineIsComplete(diagonalB)) lines.push(diagonalB)

  return lines
})

const completedCellIndices = computed<Set<number>>(
  () => new Set(completedLines.value.flat())
)
const hasBingo = computed(() => completedLines.value.length > 0)

watch(hasBingo, (value, previousValue) => {
  if (value && !previousValue) {
    showCelebration.value = true
  } else if (!value) {
    showCelebration.value = false
  }
})

function closeCelebration() {
  showCelebration.value = false
}

async function handleCelebrationExport() {
  await exportBoardAsImage()
  closeCelebration()
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const clampedRadius = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + clampedRadius, y)
  ctx.lineTo(x + width - clampedRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius)
  ctx.lineTo(x + width, y + height - clampedRadius)
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - clampedRadius,
    y + height
  )
  ctx.lineTo(x + clampedRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius)
  ctx.lineTo(x, y + clampedRadius)
  ctx.quadraticCurveTo(x, y, x + clampedRadius, y)
  ctx.closePath()
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = startY

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = candidate
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY)
    currentY += lineHeight
  }

  return currentY
}

async function exportBoardAsImage() {
  if (typeof window === 'undefined' || isExporting.value) return

  isExporting.value = true

  try {
    const cells = board.value
    const completed = completedCellIndices.value

    const cellWidth = 240
    const cellHeight = 200
    const cellGap = 24
    const padding = 72
    const headerHeight = 150

    const gridWidth = boardSize * cellWidth + (boardSize - 1) * cellGap
    const gridHeight = boardSize * cellHeight + (boardSize - 1) * cellGap

    const canvasWidth = gridWidth + padding * 2
    const canvasHeight = gridHeight + padding * 2 + headerHeight

    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Kein Canvas-Kontext verfügbar.')

    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    ctx.fillStyle = '#0f172a'
    ctx.shadowColor = 'rgba(15,90,255,0.12)'
    ctx.shadowBlur = 60
    drawRoundedRect(
      ctx,
      padding / 2,
      padding / 2,
      canvasWidth - padding,
      canvasHeight - padding,
      48
    )
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    const titleX = padding
    let titleY = padding + 60

    ctx.fillStyle = '#e2e8f0'
    ctx.font = '600 52px "Inter", "Helvetica Neue", sans-serif'
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.fillText('AMS Bingo', titleX, titleY)

    ctx.font = '400 20px "Inter", "Helvetica Neue", sans-serif'
    ctx.fillStyle = 'rgba(226,232,240,0.78)'
    titleY += 30
    drawWrappedText(
      ctx,
      'Sammle Momente aus deinem Aris Management Alltag. Markiere deine Felder und teile dein Bingo mit der Crew.',
      titleX,
      titleY + 22,
      gridWidth,
      30
    )

    const boardTop = padding + headerHeight
    const boardLeft = padding

    ctx.font = '600 18px "Inter", "Helvetica Neue", sans-serif'
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'

    for (let index = 0; index < cells.length; index++) {
      const cell = cells[index]
      const row = Math.floor(index / boardSize)
      const column = index % boardSize

      const x = boardLeft + column * (cellWidth + cellGap)
      const y = boardTop + row * (cellHeight + cellGap)

      const isCompleted = completed.has(index)

      drawRoundedRect(ctx, x, y, cellWidth, cellHeight, 28)
      ctx.save()
      if (cell.active) {
        const gradient = ctx.createLinearGradient(
          x,
          y,
          x + cellWidth,
          y + cellHeight
        )
        gradient.addColorStop(0, 'rgba(13,91,255,0.75)')
        gradient.addColorStop(1, 'rgba(13,91,255,0.25)')
        ctx.fillStyle = gradient
        ctx.shadowColor = 'rgba(13,91,255,0.25)'
        ctx.shadowBlur = 36
      } else {
        ctx.fillStyle = 'rgba(15,23,42,0.65)'
      }
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.lineWidth = isCompleted ? 4 : 2
      ctx.strokeStyle = isCompleted
        ? 'rgba(125,179,255,0.9)'
        : cell.active
        ? 'rgba(255,255,255,0.3)'
        : 'rgba(148,163,184,0.25)'
      drawRoundedRect(ctx, x, y, cellWidth, cellHeight, 28)
      ctx.stroke()
      ctx.restore()

      const textX = x + 26
      let textY = y + 52

      ctx.save()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.font = '600 16px "Inter", "Helvetica Neue", sans-serif'
      ctx.fillStyle = cell.active
        ? 'rgba(241,245,249,0.88)'
        : 'rgba(147,197,253,0.8)'
      ctx.fillText(cell.isFree ? 'FREI' : 'AMS', textX, textY)
      ctx.restore()

      ctx.save()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.font = '600 22px "Inter", "Helvetica Neue", sans-serif'
      ctx.fillStyle = cell.active ? '#f8fafc' : '#e2e8f0'
      textY += 32
      drawWrappedText(ctx, cell.label, textX, textY, cellWidth - 52, 28)
      ctx.restore()

      if (cell.isFree) {
        ctx.save()
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.font = '600 14px "Inter", "Helvetica Neue", sans-serif'
        ctx.fillStyle = 'rgba(148,197,253,0.7)'
        ctx.fillText('IMMER AKTIV', textX, y + cellHeight - 22)
        ctx.restore()
      }

      if (cell.active && !cell.isFree) {
        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '600 20px "Inter", "Helvetica Neue", sans-serif'
        ctx.fillStyle = '#f8fafc'
        ctx.globalAlpha = 0.9
        ctx.beginPath()
        const badgeX = x + cellWidth - 32
        const badgeY = y + 36
        ctx.arc(badgeX, badgeY, 18, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#0b5cff'
        ctx.globalAlpha = 1
        ctx.fillText('✓', badgeX, badgeY + 1)
        ctx.restore()
      }
    }

    const footerY = boardTop + gridHeight + 52
    ctx.save()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '500 16px "Inter", "Helvetica Neue", sans-serif'
    ctx.fillStyle = 'rgba(148,163,184,0.8)'
    ctx.fillText(
      `Stand: ${new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })}`,
      padding,
      footerY
    )
    ctx.restore()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), 'image/png', 1)
    )
    if (!blob) throw new Error('Bild konnte nicht erstellt werden.')

    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = `ams-bingo-${new Date()
      .toISOString()
      .slice(0, 10)}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)

    toast?.add({
      title: 'Bingo exportiert',
      description: 'Dein Bingo wurde als PNG heruntergeladen.',
      color: 'primary',
      icon: 'i-lucide-party-popper',
    })
  } catch (error) {
    console.error(error)
    toast?.add({
      title: 'Export fehlgeschlagen',
      description:
        error instanceof Error ? error.message : 'Bitte versuche es erneut.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[color:var(--ui-page,#020617)] py-12 text-white">
    <div
      class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8"
    >
      <div class="flex flex-col gap-8">
        <section class="relative">
          <div
            class="w-full rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(7,14,28,0.92),rgba(2,6,23,0.88))] p-5 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-7 lg:pr-24"
          >
            <div
              class="overflow-hidden rounded-[26px] border border-white/12 bg-slate-950/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <div
                class="-mx-2 overflow-x-auto pb-2 sm:mx-0 sm:overflow-visible sm:pb-0"
              >
                <div
                  class="grid min-w-[720px] grid-cols-5 gap-2 p-2 text-[10px] font-medium leading-tight text-slate-200 sm:min-w-0 sm:gap-3 sm:p-3 sm:text-[12px] sm:leading-snug lg:gap-4 lg:p-4 lg:text-sm"
                >
                  <button
                    v-for="(cell, index) in board"
                    :key="cell.id"
                    type="button"
                    class="group relative flex min-h-[120px] w-full flex-col items-start justify-between gap-3 overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(155deg,rgba(9,15,32,0.96),rgba(4,9,22,0.82))] px-4 py-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] sm:min-h-[150px] sm:px-5 sm:py-6"
                    :class="[
                      cell.active
                        ? 'border-[rgba(0,226,207,0.4)] bg-[linear-gradient(160deg,rgba(8,16,26,0.94),rgba(0,226,207,0.18))] text-white shadow-[0_16px_38px_-24px_rgba(0,226,207,0.5)] saturate-110'
                        : 'hover:border-(--ui-primary)/35 hover:bg-[linear-gradient(165deg,rgba(10,18,36,0.9),rgba(6,13,28,0.84))] hover:shadow-[0_18px_36px_-24px_rgba(15,90,255,0.4)]',
                      completedCellIndices.has(index)
                        ? 'outline outline-2 outline-offset-[-4px] outline-(--ui-primary)/70'
                        : '',
                    ]"
                    @click="toggleCell(index)"
                  >
                    <div class="relative z-10 flex w-full flex-col gap-3">
                      <div class="flex items-start justify-between gap-3">
                        <span
                          class="text-[9px] font-semibold uppercase tracking-[0.32em] text-(--ui-primary)/60 sm:text-[10px] lg:text-[11px]"
                          :class="
                            cell.active
                              ? 'text-white/90 drop-shadow-[0_0_10px_rgba(0,226,207,0.45)]'
                              : ''
                          "
                        >
                          {{ cell.isFree ? 'Freifeld' : 'AMS' }}
                        </span>
                        <span
                          v-if="cell.active && !cell.isFree"
                          class="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(0,226,207,0.4)] bg-[rgba(0,226,207,0.22)] text-white shadow-[0_8px_18px_rgba(0,226,207,0.28)] transition-transform duration-200 group-hover:scale-110 sm:h-7 sm:w-7"
                        >
                          <UIcon
                            name="i-lucide-check"
                            class="h-3.5 w-3.5 sm:h-4 sm:w-4"
                          />
                        </span>
                      </div>
                      <div class="w-full space-y-2 text-left">
                        <p
                          class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[12px] font-medium leading-6 tracking-tight text-white/85 transition-all duration-200 sm:text-[15px] lg:text-[16px]"
                          :class="
                            cell.active
                              ? 'border-[rgba(0,226,207,0.4)] bg-[rgba(0,226,207,0.12)] text-white shadow-[0_8px_24px_rgba(0,226,207,0.18)]'
                              : ''
                          "
                        >
                          {{ cell.label }}
                        </p>
                        <span
                          v-if="cell.isFree"
                          class="inline-flex items-center gap-2 rounded-full border border-(--ui-primary)/30 bg-(--ui-primary)/10 px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.28em] text-(--ui-primary)/70 sm:text-[9px] lg:text-[10px]"
                        >
                          <UIcon name="i-lucide-infinity" class="h-3 w-3" />
                          Immer aktiv
                        </span>
                      </div>
                    </div>
                    <span
                      class="pointer-events-none absolute inset-0 rounded-2xl border border-white/10 opacity-0 transition-opacity duration-200 z-0"
                      :class="
                        cell.active
                          ? 'opacity-35 border-[rgba(0,226,207,0.35)]'
                          : 'group-hover:opacity-45'
                      "
                    />
                    <span
                      class="pointer-events-none absolute inset-x-6 top-[14px] h-px bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 transition-opacity duration-200 z-0"
                      :class="
                        cell.active ? 'opacity-70' : 'group-hover:opacity-40'
                      "
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div class="pointer-events-none absolute inset-y-0 right-0 hidden lg:flex">
          <div class="pointer-events-auto group relative h-[360px] w-[320px]">
            <div
              class="absolute inset-y-0 right-0 flex h-full w-[320px] translate-x-[calc(100%-4rem)] overflow-hidden rounded-l-[32px] border border-white/10 bg-[linear-gradient(160deg,rgba(7,14,28,0.96),rgba(9,60,90,0.32))] text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80 shadow-[0_28px_60px_-34px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-transform duration-300 ease-out group-hover:translate-x-0"
            >
              <div
                class="flex w-16 flex-col items-center justify-center gap-1 border-r border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] text-[11px] transition-colors duration-200 group-hover:bg-(--ui-primary)/25 group-hover:text-(--ui-primary)"
              >
                <span>O</span>
                <span>p</span>
                <span>t</span>
                <span>i</span>
                <span>o</span>
                <span>n</span>
                <span>e</span>
                <span>n</span>
                <span class="mt-1">&lt;</span>
              </div>
              <div
                class="flex flex-1 flex-col justify-between gap-5 px-6 py-6 text-left"
              >
                <div class="space-y-2 text-white/75">
                  <div class="flex items-center gap-2 text-[11px] font-semibold tracking-[0.32em] text-white/60">
                    <UIcon name="i-lucide-corner-down-right" class="h-3.5 w-3.5" />
                    Schnellzugriff
                  </div>
                  <p class="text-[12px] leading-5 text-white/65">
                    Aktionen für dein Bingo-Board – direkt griffbereit.
                  </p>
                </div>
                <div class="flex flex-col gap-3">
                  <UButton
                    color="primary"
                    variant="soft"
                    icon="i-lucide-image-down"
                    :loading="isExporting"
                    class="justify-between"
                    @click="exportBoardAsImage"
                  >
                    Als Bild exportieren
                    <span class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
                      PNG
                    </span>
                  </UButton>
                  <UButton
                    color="primary"
                    variant="outline"
                    icon="i-lucide-shuffle"
                    class="justify-between"
                    @click="shuffleBoard"
                  >
                    Neu mischen
                    <span class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
                      Random
                    </span>
                  </UButton>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-rotate-ccw"
                    class="justify-between"
                    @click="resetBoard"
                  >
                    Zurücksetzen
                    <span class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                      Reset
                    </span>
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 lg:hidden">
          <UButton
            color="primary"
            variant="subtle"
            icon="i-lucide-image-down"
            :loading="isExporting"
            @click="exportBoardAsImage"
          >
            Als Bild exportieren
          </UButton>
          <UButton
            color="primary"
            variant="outline"
            icon="i-lucide-shuffle"
            @click="shuffleBoard"
          >
            Neu mischen
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-rotate-ccw"
            @click="resetBoard"
          >
            Zurücksetzen
          </UButton>
        </div>
      </div>

      <transition name="fade">
        <div
          v-if="hasBingo"
          class="flex items-center gap-3 rounded-2xl border border-(--ui-primary)/40 bg-(--ui-primary)/15 px-5 py-4 text-white shadow-[0_0_35px_rgba(15,90,255,0.22)]"
        >
          <UIcon
            name="i-lucide-party-popper"
            class="h-6 w-6 text-(--ui-primary)"
          />
          <p class="text-sm font-semibold">
            Bingo! Du hast {{ completedLines.length }}
            {{ completedLines.length === 1 ? 'Linie' : 'Linien' }}
            abgeschlossen.
          </p>
        </div>
      </transition>
    </div>
  </div>

  <Transition name="bingo-overlay">
    <div
      v-if="showCelebration"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/70 backdrop-blur-sm"
        role="presentation"
        @click="closeCelebration"
      />
      <div
        class="relative z-10 mx-4 flex max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-[36px] border border-(--ui-primary)/30 bg-[radial-gradient(circle_at_top,_rgba(16,108,255,0.24),rgba(3,7,18,0.92))] p-10 text-center shadow-[0_45px_120px_-40px_rgba(11,92,255,0.7)]"
      >
        <span class="celebration-glow" />
        <span class="confetti confetti-1" />
        <span class="confetti confetti-2" />
        <span class="confetti confetti-3" />
        <div class="flex flex-col items-center gap-3">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="h-4 w-4 text-(--ui-primary)"
            />
            Bingo Confirmed
          </span>
          <h2
            class="text-4xl font-semibold leading-tight text-white md:text-5xl"
          >
            ArisCorp Crew hat Bingo!
          </h2>
          <p class="max-w-xl text-sm text-slate-200/80 md:text-base">
            {{ completedLines.length }}
            {{ completedLines.length === 1 ? 'Linie' : 'Linien' }} abgeschlossen
            – starke Leistung! Teile den Moment mit deiner Crew oder starte
            direkt in die nächste Runde.
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <UButton
            color="primary"
            icon="i-lucide-party-popper"
            @click="closeCelebration"
          >
            Weiter spielen
          </UButton>
          <UButton
            variant="ghost"
            color="gray"
            icon="i-lucide-image-down"
            :loading="isExporting"
            @click="handleCelebrationExport"
          >
            Bingo speichern
          </UButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bingo-overlay-enter-active,
.bingo-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.bingo-overlay-enter-from,
.bingo-overlay-leave-to {
  opacity: 0;
}

.celebration-glow {
  position: absolute;
  inset: -60%;
  background: radial-gradient(circle, rgba(15, 91, 255, 0.18), transparent 55%);
  animation: pulseGlow 4s ease-in-out infinite;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 220px;
  height: 220px;
  background: conic-gradient(
    from 45deg,
    rgba(80, 160, 255, 0.5),
    rgba(255, 255, 255, 0.35),
    rgba(80, 160, 255, 0.5)
  );
  filter: blur(28px);
  opacity: 0.85;
  animation: confettiSpin 9s linear infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}

.confetti-1 {
  top: -60px;
  left: -120px;
  animation-duration: 10s;
}

.confetti-2 {
  bottom: -80px;
  right: -140px;
  animation-duration: 12s;
  animation-direction: reverse;
}

.confetti-3 {
  top: 40%;
  right: -100px;
  width: 160px;
  height: 160px;
  animation-duration: 8s;
}

@keyframes pulseGlow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.75;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes confettiSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
