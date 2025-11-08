'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Reference } from '@/types'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowUpIcon,
  BookOpenIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

// Mock references data
const mockReferences: Reference[] = [
  {
    id: '1',
    title: 'Deep Learning for Medical Image Analysis: A Comprehensive Review',
    authors: [
      { firstName: 'John', lastName: 'Smith' },
      { firstName: 'Jane', lastName: 'Doe' },
    ],
    publication: {
      journal: 'Nature Medicine',
      year: 2023,
      volume: '29',
      issue: '4',
      pages: '123-145',
      doi: '10.1038/s41591-023-01234-5',
    },
    metadata: {
      type: 'journal',
      abstract: 'This comprehensive review examines the latest advances in deep learning applications for medical image analysis...',
      keywords: ['deep learning', 'medical imaging', 'artificial intelligence', 'healthcare'],
      citationCount: 156,
      impactFactor: 87.241,
    },
    tags: ['AI', 'Healthcare', 'Deep Learning'],
    notes: 'Excellent overview of current state-of-the-art methods. Key reference for methodology section.',
    attachments: [],
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    title: 'Sustainable Energy Systems: Challenges and Opportunities',
    authors: [
      { firstName: 'Alice', lastName: 'Johnson' },
      { firstName: 'Bob', lastName: 'Wilson' },
    ],
    publication: {
      journal: 'Energy Policy',
      year: 2023,
      volume: '175',
      pages: '113456',
      doi: '10.1016/j.enpol.2023.113456',
    },
    metadata: {
      type: 'journal',
      abstract: 'This paper discusses the challenges and opportunities in developing sustainable energy systems...',
      keywords: ['renewable energy', 'sustainability', 'energy policy', 'climate change'],
      citationCount: 89,
      impactFactor: 6.142,
    },
    tags: ['Energy', 'Sustainability', 'Policy'],
    notes: 'Important for background on energy policy frameworks.',
    attachments: [],
    createdAt: '2024-01-08',
  },
]

export default function ReferencesPage() {
  const [references] = useState<Reference[]>(mockReferences)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredReferences = references.filter(ref => {
    const matchesSearch = 
      ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.authors.some(author => 
        `${author.firstName} ${author.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      ref.metadata.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesType = selectedType === 'all' || ref.metadata.type === selectedType
    return matchesSearch && matchesType
  })

  const types = ['all', 'journal', 'conference', 'book', 'thesis', 'report', 'website']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reference Manager</h1>
          <p className="text-gray-600">Organize and manage your research references</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Reference
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title, author, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {types.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reference Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{references.length}</div>
              <div className="text-sm text-gray-600">Total References</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {references.filter(r => r.metadata.type === 'journal').length}
              </div>
              <div className="text-sm text-gray-600">Journal Articles</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {references.reduce((sum, r) => sum + (r.metadata.citationCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Citations</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(references.flatMap(r => r.tags)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Tags</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* References List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {filteredReferences.length} Reference{filteredReferences.length !== 1 ? 's' : ''}
        </h2>

        {filteredReferences.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No references found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start building your reference library by adding your first reference.'
                  }
                </p>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Reference
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReferences.map((reference) => (
              <Card key={reference.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {reference.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {reference.authors.map(author => `${author.firstName} ${author.lastName}`).join(', ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {reference.publication.journal && (
                            <>
                              <span className="font-medium">{reference.publication.journal}</span>
                              {reference.publication.volume && ` ${reference.publication.volume}`}
                              {reference.publication.issue && `(${reference.publication.issue})`}
                              {reference.publication.pages && `, ${reference.publication.pages}`}
                              {` (${reference.publication.year})`}
                            </>
                          )}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {reference.metadata.type}
                      </Badge>
                    </div>

                    {reference.metadata.abstract && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {reference.metadata.abstract}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {reference.metadata.citationCount && (
                          <span>Citations: {reference.metadata.citationCount}</span>
                        )}
                        {reference.metadata.impactFactor && (
                          <span>IF: {reference.metadata.impactFactor}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {reference.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {reference.notes && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Notes:</strong> {reference.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}