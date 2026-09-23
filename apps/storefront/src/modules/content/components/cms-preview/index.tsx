"use client"

export default function CmsPreview() {
  return <div className="fixed bottom-5 left-5 z-[1000] flex items-center gap-4 rounded-sm bg-homestead-forest px-5 py-3 text-sm text-homestead-cream shadow-lg"><span>Sanity draft preview</span><button className="underline" onClick={async () => { const response = await fetch("/api/draft-mode/disable", { method: "POST" }); if (response.ok) window.location.reload() }}>Exit preview</button></div>
}
