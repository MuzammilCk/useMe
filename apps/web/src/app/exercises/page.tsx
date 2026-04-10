import { ExerciseFilters } from "@/components/ExerciseFilters"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Need to match ApiResponse export loosely since we fetch over HTTP
interface ExerciseApiResponse {
  success: boolean
  data: any[]
  meta?: { limit: number; cursor?: string }
}

async function getExercises(searchParams: { [key: string]: string | string[] | undefined }) {
  const query = new URLSearchParams()
  
  if (searchParams.search) query.append("search", searchParams.search as string)
  if (searchParams.cursor) query.append("cursor", searchParams.cursor as string)
  if (searchParams.muscleGroup) {
    const groups = Array.isArray(searchParams.muscleGroup) ? searchParams.muscleGroup : [searchParams.muscleGroup]
    groups.forEach(g => query.append("muscleGroup", g))
  }
  
  // NOTE: Depending on your setup, you'll want to use an env variable for the API url.
  // Using localhost to mock standard development environment target.
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1"
  
  try {
    const res = await fetch(`${API_URL}/exercises?${query.toString()}`, {
      // Opt into Next.js cache bypass if cursor differs to handle keyset properly
      cache: "no-store", 
    })
    
    if (!res.ok) throw new Error("Failed to fetch exercises")
    return (await res.json()) as ExerciseApiResponse
  } catch (error) {
    console.error("Fetch exercises error:", error)
    return { success: false, data: [] }
  }
}

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const result = await getExercises(searchParams)
  const exercises = result.data || []
  const nextCursor = result.meta?.cursor

  // Compute next URL for pagination
  const currentParams = new URLSearchParams()
  if (searchParams.search) currentParams.set("search", searchParams.search as string)
  if (searchParams.muscleGroup) {
    const groups = Array.isArray(searchParams.muscleGroup) ? searchParams.muscleGroup : [searchParams.muscleGroup]
    groups.forEach(g => currentParams.append("muscleGroup", g))
  }
  if (nextCursor) currentParams.set("cursor", nextCursor)
  const nextUrl = `/exercises?${currentParams.toString()}`

  return (
    <div className="container mx-auto py-10 px-4 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
        <Link href="/admin/exercises/new">
          <Button>Add Exercise (Admin)</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full md:w-1/4">
          <ExerciseFilters />
        </aside>
        
        <main className="flex-1">
          {exercises.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <h3 className="text-lg font-medium">No exercises found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exercises.map((exercise) => (
                <Link key={exercise.id} href={`/exercises/${exercise.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        {exercise.isBodyweight && <Badge variant="secondary">Bodyweight</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {exercise.description || "No description provided."}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Level {exercise.difficultyLevel}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {nextCursor && (
            <div className="mt-8 flex justify-center">
              <Link href={nextUrl}>
                <Button variant="outline">Load More</Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
