"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "./ui/input"

export function ExerciseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Debounce search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    
    // reset cursor on new search
    params.delete("cursor")
    
    router.replace(`/exercises?${params.toString()}`)
  }

  // Simplified muscle group selection via search params
  const toggleMuscleGroup = (group: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.getAll("muscleGroup")
    
    params.delete("muscleGroup")
    
    if (current.includes(group)) {
      current.filter(g => g !== group).forEach(g => params.append("muscleGroup", g))
    } else {
      current.forEach(g => params.append("muscleGroup", g))
      params.append("muscleGroup", group)
    }
    
    params.delete("cursor")
    router.replace(`/exercises?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-xs space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium">Search</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search exercises..." 
            className="pl-8" 
            defaultValue={searchParams.get("search") || ""}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div>
        <h3 className="mb-2 text-sm font-medium">Muscle Groups</h3>
        <div className="flex flex-wrap gap-2">
          {['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Shoulders'].map(m => {
            const isActive = searchParams.getAll("muscleGroup").includes(m)
            return (
              <button
                key={m}
                onClick={() => toggleMuscleGroup(m)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {m}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
