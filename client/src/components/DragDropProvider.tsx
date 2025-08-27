import type React from "react"

import { createContext, useContext, useState } from "react"

interface DragDropContextType {
  draggedIndex: number | null
  setDraggedIndex: (index: number | null) => void
  onReorder: (startIndex: number, endIndex: number) => void
}

const DragDropContext = createContext<DragDropContextType | null>(null)

export function useDragDrop() {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error("useDragDrop must be used within a DragDropProvider")
  }
  return context
}

interface DragDropProviderProps {
  children: React.ReactNode
  onReorder: (startIndex: number, endIndex: number) => void
}

export function DragDropProvider({ children, onReorder }: DragDropProviderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  return (
    <DragDropContext.Provider value={{ draggedIndex, setDraggedIndex, onReorder }}>{children}</DragDropContext.Provider>
  )
}
