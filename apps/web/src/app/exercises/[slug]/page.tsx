import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getExerciseInfo(slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1"
  const res = await fetch(`${API_URL}/exercises/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  return (await res.json())?.data
}

export default async function ExerciseDetailPage({
  params
}: {
  params: { slug: string }
}) {
  const exercise = await getExerciseInfo(params.slug)

  if (!exercise) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Exercise not found</h1>
        <Link href="/exercises" className="mt-4 inline-block text-blue-500 hover:underline">
          Return to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/exercises">
          <Button variant="ghost" size="sm" className="gap-2 -ml-3 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to library
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{exercise.name}</h1>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">Difficulty {exercise.difficultyLevel}/5</Badge>
            {exercise.isBodyweight && <Badge variant="secondary">Bodyweight</Badge>}
            {exercise.isUnilateral && <Badge variant="secondary">Unilateral</Badge>}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Description</h2>
              <p className="text-zinc-600 dark:text-zinc-300">
                {exercise.description || "No detailed description available."}
              </p>
            </section>

            {exercise.instructions && exercise.instructions.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Instructions</h2>
                <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-zinc-300">
                  {exercise.instructions.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </section>
            )}

            {exercise.formTips && exercise.formTips.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">Form Tips</h2>
                <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-300">
                  {exercise.formTips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 h-fit border">
            {/* Real DB data would populate this diagram accurately */}
            <h3 className="font-semibold mb-4 text-lg border-b pb-2">Muscles Targeted</h3>
            <div className="flex flex-col gap-2">
              {exercise.muscleGroups?.map((mg: any) => (
                <div key={mg.muscleGroupId} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{mg.muscleGroup?.name || "Unknown"}</span>
                  <Badge variant={mg.isPrimary ? 'default' : 'outline'}>
                    {mg.isPrimary ? 'Primary' : 'Secondary'}
                  </Badge>
                </div>
              ))}
              {(!exercise.muscleGroups || exercise.muscleGroups.length === 0) && (
                <span className="text-sm text-muted-foreground">Not specified</span>
              )}
            </div>

            <h3 className="font-semibold mt-6 mb-4 text-lg border-b pb-2">Equipment Needed</h3>
            <div className="flex flex-wrap gap-2">
              {exercise.equipment?.map((eq: any) => (
                 <Badge key={eq.equipmentId} variant="secondary">
                   {eq.equipment?.name || "Unknown"}
                 </Badge>
              ))}
              {(!exercise.equipment || exercise.equipment.length === 0) && (
                <span className="text-sm text-muted-foreground">None / Bodyweight</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
