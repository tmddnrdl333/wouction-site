export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-500">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}
