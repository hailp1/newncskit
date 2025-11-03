'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ProjectSummary, ResearchPhase } from '@/types'
import {
  BeakerIcon,
  PencilIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

interface ProjectCardProps {
  project: ProjectSummary
}

const phaseIcons = {
  planning: BeakerIcon,
  execution: ChartBarIcon,
  writing: DocumentTextIcon,
  submission: PaperAirplaneIcon,
  management: PencilIcon,
}

const phaseColors = {
  planning: 'bg-blue-100 text-blue-800',
  execution: 'bg-yellow-100 text-yellow-800',
  writing: 'bg-green-100 text-green-800',
  submission: 'bg-purple-100 text-purple-800',
  management: 'bg-gray-100 text-gray-800',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const PhaseIcon = phaseIcons[project.phase]
  const phaseColor = phaseColors[project.phase]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
          <Badge className={phaseColor}>
            <PhaseIcon className="w-3 h-3 mr-1" />
            {project.phase}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{project.progress}% complete</span>
          <div className="flex items-center space-x-4">
            {project.collaboratorCount > 0 && (
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1" />
                {project.collaboratorCount}
              </div>
            )}
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {new Date(project.lastActivity).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/projects/${project.id}`}>
              Open Project
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/editor?project=${project.id}`}>
              <PencilIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}