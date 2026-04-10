export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
          Fitness Platform Web
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          Enterprise-grade fitness tracking &amp; planning
        </p>
      </main>
    </div>
  );
}
