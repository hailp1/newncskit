'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, BookOpen, Filter, X } from 'lucide-react'

interface Theory {
  id: number
  theory: string
  constructs_full?: string
  constructs_code?: string
  note_vi?: string
  group?: string
  domain?: string
  dependent_variable?: string
  reference?: string
  application_vi?: string
  definition_long?: string
  constructs_detailed?: Array<{ name: string; desc: string }>
  sample_scales?: string[]
  related_theories?: string[]
  limitations?: string
}

interface TheoryDetailModalProps {
  theory: Theory | null
  onClose: () => void
}

function TheoryDetailModal({ theory, onClose }: TheoryDetailModalProps) {
  if (!theory) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{theory.theory}</CardTitle>
              {theory.reference && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Trích dẫn:</strong> {theory.reference}
                </p>
              )}
              {theory.group && (
                <Badge variant="outline" className="mr-2">
                  {theory.group}
                </Badge>
              )}
              {theory.domain && (
                <Badge variant="outline">
                  {theory.domain}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {theory.note_vi && (
            <div>
              <h3 className="font-semibold mb-2">Ghi chú</h3>
              <p className="text-sm text-gray-700">{theory.note_vi}</p>
            </div>
          )}

          {theory.definition_long && (
            <div>
              <h3 className="font-semibold mb-2">Định nghĩa</h3>
              <p className="text-sm text-gray-700">{theory.definition_long}</p>
            </div>
          )}

          {theory.constructs_full && (
            <div>
              <h3 className="font-semibold mb-2">Biến & Mã hóa</h3>
              <p className="text-sm text-gray-700 mb-1">{theory.constructs_full}</p>
              {theory.constructs_code && (
                <p className="text-sm font-mono text-blue-600">{theory.constructs_code}</p>
              )}
            </div>
          )}

          {theory.constructs_detailed && theory.constructs_detailed.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Chi tiết các biến</h3>
              <ul className="space-y-2">
                {theory.constructs_detailed.map((construct, idx) => (
                  <li key={idx} className="text-sm">
                    <strong>{construct.name}:</strong> {construct.desc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {theory.dependent_variable && (
            <div>
              <h3 className="font-semibold mb-2">Biến phụ thuộc</h3>
              <p className="text-sm text-gray-700">{theory.dependent_variable}</p>
            </div>
          )}

          {theory.application_vi && (
            <div>
              <h3 className="font-semibold mb-2">Ứng dụng</h3>
              <p className="text-sm text-gray-700">{theory.application_vi}</p>
            </div>
          )}

          {theory.sample_scales && theory.sample_scales.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Thang đo mẫu</h3>
              <ul className="list-disc list-inside space-y-1">
                {theory.sample_scales.map((scale, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{scale}</li>
                ))}
              </ul>
            </div>
          )}

          {theory.related_theories && theory.related_theories.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Lý thuyết liên quan</h3>
              <div className="flex flex-wrap gap-2">
                {theory.related_theories.map((related, idx) => (
                  <Badge key={idx} variant="secondary">{related}</Badge>
                ))}
              </div>
            </div>
          )}

          {theory.limitations && (
            <div>
              <h3 className="font-semibold mb-2">Hạn chế</h3>
              <p className="text-sm text-gray-700">{theory.limitations}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ModelTheoriesPage() {
  const [theories, setTheories] = useState<Theory[]>([])
  const [filteredTheories, setFilteredTheories] = useState<Theory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedTheory, setSelectedTheory] = useState<Theory | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const [domains, setDomains] = useState<string[]>([])

  // Load theories
  useEffect(() => {
    async function loadTheories() {
      try {
        setLoading(true)
        const response = await fetch('/api/theories?limit=1000')
        const data = await response.json()
        
        if (data.success) {
          setTheories(data.theories)
          setFilteredTheories(data.theories)
          
          // Extract unique groups and domains
          const uniqueGroups = [...new Set(data.theories.map((t: Theory) => t.group).filter(Boolean))]
          const uniqueDomains = [...new Set(data.theories.map((t: Theory) => t.domain).filter(Boolean))]
          setGroups(uniqueGroups.sort() as string[])
          setDomains(uniqueDomains.sort() as string[])
        }
      } catch (error) {
        console.error('Error loading theories:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTheories()
  }, [])

  // Filter theories
  useEffect(() => {
    let filtered = theories

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(t =>
        t.theory.toLowerCase().includes(searchLower) ||
        t.note_vi?.toLowerCase().includes(searchLower) ||
        t.domain?.toLowerCase().includes(searchLower) ||
        t.reference?.toLowerCase().includes(searchLower) ||
        t.constructs_full?.toLowerCase().includes(searchLower)
      )
    }

    if (selectedGroup) {
      filtered = filtered.filter(t => t.group === selectedGroup)
    }

    if (selectedDomain) {
      filtered = filtered.filter(t => t.domain?.includes(selectedDomain))
    }

    setFilteredTheories(filtered)
  }, [searchTerm, selectedGroup, selectedDomain, theories])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedGroup('')
    setSelectedDomain('')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Tra Cứu Lý Thuyết & Mô Hình Khoa Học
        </h1>
        <p className="text-gray-600 mt-2">
          Khám phá và tra cứu các lý thuyết, mô hình nền tảng trong lĩnh vực Marketing và Quản trị
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm lý thuyết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo nhóm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả nhóm</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo lĩnh vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả lĩnh vực</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleResetFilters}>
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Hiển thị {filteredTheories.length} / {theories.length} lý thuyết
      </div>

      {/* Theories list */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : filteredTheories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Không tìm thấy lý thuyết nào phù hợp</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTheories.map((theory) => (
            <Card
              key={theory.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedTheory(theory)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{theory.theory}</CardTitle>
                <CardDescription>
                  {theory.note_vi || theory.definition_long?.substring(0, 100) + '...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {theory.group && (
                    <Badge variant="outline">{theory.group}</Badge>
                  )}
                  {theory.domain && (
                    <Badge variant="secondary" className="ml-2">
                      {theory.domain.split(',')[0]}
                    </Badge>
                  )}
                  {theory.reference && (
                    <p className="text-xs text-gray-500 mt-2">
                      {theory.reference}
                    </p>
                  )}
                  {theory.constructs_code && (
                    <p className="text-xs font-mono text-blue-600 mt-2">
                      {theory.constructs_code}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <TheoryDetailModal
        theory={selectedTheory}
        onClose={() => setSelectedTheory(null)}
      />
    </div>
  )
}

