"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertExerciseSchema, z } from "@fitness/types"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = insertExerciseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}) as unknown as z.ZodType<any, any, any>

interface FormData {
  name: string
  slug: string
  description?: string | null
  difficultyLevel: number
  isBodyweight?: boolean | null
  isUnilateral?: boolean | null
}

export default function NewExercisePage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isBodyweight: false,
      isUnilateral: false,
      difficultyLevel: 1,
    }
  })

  // Watch booleans for custom checkbox mapping since native checkboxes need special handling in RHF with custom UI component
  const isBodyweight = watch("isBodyweight")
  const isUnilateral = watch("isUnilateral")

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1"
      const res = await fetch(`${API_URL}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to create exercise")
      }

      router.push("/exercises")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Add New Exercise</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900 border p-6 rounded-xl">
          <div>
            <Label htmlFor="name">Exercise Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. Barbell Squat" className="mt-1" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="slug">Slug Identifier</Label>
            <Input id="slug" {...register("slug")} placeholder="e.g. barbell-squat" className="mt-1" />
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} placeholder="Short summary" className="mt-1" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="difficultyLevel">Difficulty Level (1-5)</Label>
            <Input 
              id="difficultyLevel" 
              type="number" 
              {...register("difficultyLevel", { valueAsNumber: true })} 
              min={1} max={5} 
              className="mt-1" 
            />
            {errors.difficultyLevel && <p className="text-xs text-red-500 mt-1">{errors.difficultyLevel.message}</p>}
          </div>

          <div className="flex gap-6 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isBodyweight" 
                checked={isBodyweight || false} 
                onChange={(e) => setValue("isBodyweight", e.target.checked)}
              />
              <Label htmlFor="isBodyweight" className="cursor-pointer">Bodyweight Exercise</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isUnilateral" 
                checked={isUnilateral || false} 
                onChange={(e) => setValue("isUnilateral", e.target.checked)}
              />
              <Label htmlFor="isUnilateral" className="cursor-pointer">Unilateral Movement</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Exercise"}
          </Button>
        </div>
      </form>
    </div>
  )
}
