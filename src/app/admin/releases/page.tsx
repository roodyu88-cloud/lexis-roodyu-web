"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminReleasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, title, description, downloadUrl }),
      });

      if (!res.ok) throw new Error("Failed to create release");
      
      alert("Release published successfully!");
      setVersion("");
      setTitle("");
      setDescription("");
      setDownloadUrl("");
    } catch (error) {
      console.error(error);
      alert("Error creating release");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Publish New Release
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Version Tag</label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g., v1.0.0"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Release Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Major Performance Update"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Download URL</label>
            <input
              type="url"
              required
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="e.g., https://example.com/download.exe"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Changelog / Description</label>
            <textarea
              required
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="- Added new feature X&#10;- Fixed bug Y"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {isLoading ? "Publishing..." : "Publish Release"}
          </button>
        </form>
      </div>
    </div>
  );
}
