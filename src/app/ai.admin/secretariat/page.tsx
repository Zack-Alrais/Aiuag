"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Plus, Pencil, Trash2, Users, Mail, Phone, User, X,
  GripVertical, ChevronDown, ChevronUp, Crown, Shield,
} from "lucide-react"
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import FileUpload from "@/components/admin/FileUpload"
import { useAdminLang } from "../admin-lang"

interface SecretariatMember {
  id: string
  name: string
  nameEn: string
  role: string
  roleEn: string | null
  bio: string | null
  phone: string | null
  email: string | null
  image: string | null
  order: number | null
  createdAt: string
}

interface SecretariatFormData {
  name: string
  nameEn: string
  role: string
  roleEn: string
  bio: string
  phone: string
  email: string
  image: string
  order: string
}

const emptyForm: SecretariatFormData = {
  name: "", nameEn: "", role: "", roleEn: "",
  bio: "", phone: "", email: "", image: "", order: "",
}

const LEVELS = [
  { label: "رئيس الرابطة", labelEn: "President", startOrder: 1, endOrder: 1, color: "from-amber-600 to-amber-700", gridCols: "grid-cols-1", icon: "crown" },
  { label: "القادة", labelEn: "Leadership", startOrder: 2, endOrder: 4, color: "from-blue-600 to-blue-700", gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", icon: "shield" },
  { label: "الأمناء", labelEn: "Secretaries", startOrder: 5, endOrder: 17, color: "from-emerald-600 to-emerald-700", gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", icon: "shield" },
  { label: "نواب الأمناء", labelEn: "Deputy Secretaries", startOrder: 18, endOrder: 26, color: "from-violet-600 to-violet-700", gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", icon: "shield" },
  { label: "الأعضاء", labelEn: "Members", startOrder: 27, endOrder: 29, color: "from-gray-600 to-gray-700", gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5", icon: "shield" },
] as const

const borderColors = [
  "border-amber-500 dark:border-amber-400",
  "border-blue-500 dark:border-blue-400",
  "border-emerald-500 dark:border-emerald-400",
  "border-violet-500 dark:border-violet-400",
  "border-gray-500 dark:border-gray-400",
]

function LevelIcon({ icon }: { icon: string }) {
  if (icon === "crown") return <Crown className="w-4 h-4" />
  return <Shield className="w-4 h-4" />
}

function SortableCard({
  item, levelIndex, slotIndex, isPlaceholder,
  onEdit, onDelete, deleteConfirmId, onToggle, isOpen,
}: {
  item: SecretariatMember | null
  levelIndex: number
  slotIndex: number
  isPlaceholder: boolean
  onEdit: (m: SecretariatMember) => void
  onDelete: (id: string) => void
  deleteConfirmId: string | null
  onToggle: () => void
  isOpen: boolean
}) {
  const { t } = useAdminLang()
  const stableId = item?.id ?? `vacant-${levelIndex}-${slotIndex}`
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stableId,
    disabled: isPlaceholder,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  if (isPlaceholder || !item) {
    return (
      <div className="border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-2xl p-4 text-center min-h-[160px] flex flex-col items-center justify-center opacity-50">
        <User className="w-10 h-10 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("secretariat.vacant")}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{t("secretariat.vacant")}</p>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-[#1a2332] rounded-2xl border-2 ${borderColors[levelIndex]} shadow-lg overflow-hidden min-h-[180px] flex flex-col`}
    >
      <div className="p-3 sm:p-4 text-center relative flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-grab active:cursor-grabbing text-gray-500 touch-target"
            role="button"
            aria-label={t("secretariat.dragAria")}
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(item) }}
              className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors touch-target"
              aria-label={t("secretariat.editAria")}
            >
              <Pencil className="w-4 h-4" />
            </button>
            {deleteConfirmId === item.id ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors touch-target"
                >
                  {t("common.confirm")}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(null as any) }}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target"
                >
                  {t("common.cancel")}
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                className="p-2.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors touch-target"
                aria-label={t("secretariat.deleteAria")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 min-h-0 mt-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-md mb-3 flex-shrink-0">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary/50" />
              </div>
            )}
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-tight truncate w-full px-1">{item.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate w-full px-1">{item.nameEn}</p>
          <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-white shadow-sm ${LEVELS[levelIndex].color}`}>
            {item.role}
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm sm:text-base">
          {item.bio && <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.bio}</p>}
          {item.email && (
            <a href={`mailto:${item.email}`} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline touch-target">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.email}</span>
            </a>
          )}
          {item.phone && (
            <a href={`tel:${item.phone}`} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline touch-target">
              <Phone className="w-4 h-4 shrink-0" />
              <span dir="ltr">{item.phone}</span>
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function LevelSection({
  levelIndex, items, openId, setOpenId, onEdit, onDelete, deleteConfirmId, onReorder,
}: {
  levelIndex: number
  items: (SecretariatMember | null)[]
  openId: string | null
  setOpenId: (id: string | null) => void
  onEdit: (m: SecretariatMember) => void
  onDelete: (id: string) => void
  deleteConfirmId: string | null
  onReorder: (orders: { id: string; order: number }[]) => void
}) {
  const { lang, t } = useAdminLang()
  const level = LEVELS[levelIndex]
  const [expanded, setExpanded] = useState(true)

  const sortableItems = useMemo(
    () => items.filter((x): x is SecretariatMember => x !== null).map((x) => x.id),
    [items]
  )

  // Add touch sensor for mobile drag
  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 8, delay: 100 },
      // Allow drag from the grip handle only
    }),
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8, delay: 100 },
    })
  )

  return (
    <div className="mb-4 sm:mb-6">
      {/* Vertical connector line */}
      {levelIndex > 0 && (
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600" />
        </div>
      )}

      {/* Horizontal connector */}
      {levelIndex > 0 && items.filter(Boolean).length > 1 && (
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="h-0.5 w-3/4 max-w-md bg-gray-300 dark:bg-gray-600" />
        </div>
      )}

      {/* Level label */}
      <div className="text-center mb-4 sm:mb-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r ${level.color} shadow-md hover:shadow-lg transition-all touch-target`}
        >
          <LevelIcon icon={level.icon} />
          {lang === "ar" ? level.label : level.labelEn}
          <span className="opacity-90 font-medium">({items.filter(Boolean).length}/{items.length})</span>
          {expanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>

      {/* Cards */}
      {expanded && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event: DragEndEvent) => {
            const { active, over } = event
            if (!over || active.id === over.id) return

            const real = items.filter((x): x is SecretariatMember => x !== null)
            const oldIdx = real.findIndex((x) => x.id === active.id)
            const newIdx = real.findIndex((x) => x.id === over.id)
            if (oldIdx === -1 || newIdx === -1) return

            const reordered = [...real]
            const [removed] = reordered.splice(oldIdx, 1)
            reordered.splice(newIdx, 0, removed)

            const orders = reordered.map((m, i) => ({ id: m.id, order: level.startOrder + i }))
            onReorder(orders)
            fetch("/api/admin/secretariat/reorder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orders }),
            }).catch(() => {})
          }}
          sensors={sensors}
        >
          <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
            <div className={`grid ${level.gridCols} gap-3 sm:gap-4 max-w-full mx-auto`}>
              {items.map((item, i) => {
                const isPlaceholder = item === null
                const realItem = item as SecretariatMember | null
                return (
                  <SortableCard
                    key={isPlaceholder ? `vacant-${levelIndex}-${i}` : realItem!.id}
                    item={realItem}
                    levelIndex={levelIndex}
                    slotIndex={i}
                    isPlaceholder={isPlaceholder}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    deleteConfirmId={deleteConfirmId}
                    isOpen={openId === realItem?.id}
                    onToggle={() => setOpenId(openId === realItem?.id ? null : (realItem?.id ?? null))}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

export default function SecretariatManagement() {
  const { lang, t } = useAdminLang()
  const [items, setItems] = useState<SecretariatMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<SecretariatMember | null>(null)
  const [form, setForm] = useState<SecretariatFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/secretariat")
      const json = await res.json()
      setItems(json.data ?? json.secretariat ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleReorder = useCallback((orders: { id: string; order: number }[]) => {
    setItems((prev) =>
      prev.map((m) => {
        const update = orders.find((o) => o.id === m.id)
        return update ? { ...m, order: update.order } : m
      })
    )
  }, [])

  // Build fixed-slot arrays per level
  const levelSlots = useMemo(() => {
    const sorted = [...items].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    return LEVELS.map((level) => {
      const slots: (SecretariatMember | null)[] = []
      for (let o = level.startOrder; o <= level.endOrder; o++) {
        const member = sorted.find((m) => m.order === o)
        slots.push(member ?? null)
      }
      return slots
    })
  }, [items])

  const openAddModal = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (item: SecretariatMember) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      nameEn: item.nameEn,
      role: item.role,
      roleEn: item.roleEn ?? "",
      bio: item.bio ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      image: item.image ?? "",
      order: item.order != null ? String(item.order) : "",
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name, nameEn: form.nameEn, role: form.role,
        roleEn: form.roleEn || null, bio: form.bio || null,
        phone: form.phone || null, email: form.email || null,
        image: form.image || null, order: form.order ? Number(form.order) : null,
      }
      if (editingItem) {
        await fetch(`/api/admin/secretariat/${editingItem.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/secretariat", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        })
      }
      await fetchItems()
      closeModal()
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/secretariat/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchItems()
    } catch {
    }
  }

  const handleFieldChange = (field: keyof SecretariatFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("secretariat.title")}</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t("secretariat.count").replace("{n}", String(items.length))}</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm font-medium touch-target w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t("secretariat.addBtn")}</span>
        </button>
      </div>

      {/* Hierarchy Tree */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-3 sm:p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <Users className="h-5 w-5 animate-spin mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base">{t("secretariat.loading")}</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 mb-3 opacity-40" />
            <p className="text-sm sm:text-base mb-3">{t("secretariat.empty")}</p>
            <button onClick={openAddModal} className="text-blue-600 dark:text-blue-400 text-sm font-medium underline touch-target py-2">
              {t("secretariat.addFirst")}
            </button>
          </div>
        ) : (
          <div className="max-w-full mx-auto">
            {levelSlots.map((slots, i) => (
              <LevelSection
                key={i}
                levelIndex={i}
                items={slots}
                openId={openId}
                setOpenId={setOpenId}
                onEdit={openEditModal}
                onDelete={(id) => setDeleteConfirmId(id === deleteConfirmId ? null : id)}
                deleteConfirmId={deleteConfirmId}
                onReorder={handleReorder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {editingItem ? t("secretariat.editTitle") : t("secretariat.addTitle")}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-target"
                aria-label={t("secretariat.closeAria")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("secretariat.nameArLabel")} *</label>
                  <input type="text" required dir="rtl" value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all touch-target"
                    placeholder={t("secretariat.nameArPh")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("secretariat.nameEnLabel")} *</label>
                  <input type="text" required value={form.nameEn}
                    onChange={(e) => handleFieldChange("nameEn", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all touch-target"
                    placeholder={t("secretariat.nameEnPh")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("secretariat.roleArLabel")} *</label>
                  <input type="text" required dir="rtl" value={form.role}
                    onChange={(e) => handleFieldChange("role", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all touch-target"
                    placeholder={t("secretariat.roleArPh")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("secretariat.roleEnLabel")}</label>
                  <input type="text" value={form.roleEn}
                    onChange={(e) => handleFieldChange("roleEn", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all touch-target"
                    placeholder={t("secretariat.roleEnPh")} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("secretariat.bioLabel")}</label>
                <textarea rows={3} dir="rtl" value={form.bio}
                  onChange={(e) => handleFieldChange("bio", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y touch-target"
                  placeholder={t("secretariat.bioPh")} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {t("common.phone")}
                  </label>
                  <input type="tel" value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all touch-target"
                    placeholder="+966 5X XXX XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {t("common.email")}
                  </label>
                  <input type="email" value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all touch-target"
                    placeholder="email@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("secretariat.orderLabel")}</label>
                <input type="number" min="1" max="29" value={form.order}
                  onChange={(e) => handleFieldChange("order", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all touch-target"
                  placeholder="1-29" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("secretariat.imageLabel")}</label>
                <FileUpload value={form.image} onChange={(url) => handleFieldChange("image", url)} folder="secretariat" type="image" />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors touch-target w-full sm:w-auto">
                  {t("common.cancel")}
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target w-full sm:w-auto">
                  {submitting ? t("common.saving") : editingItem ? t("secretariat.updateBtn") : t("secretariat.createBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
