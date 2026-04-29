import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Upload, Link, MessageSquare } from "lucide-react";

interface Props {
  profileId: Id<"profiles">;
  claimId: Id<"claims">;
  onSubmit: () => void;
  onSkip: () => void;
}

export function EvidenceUploader({ profileId, claimId, onSubmit, onSkip }: Props) {
  const [activeTab, setActiveTab] = useState<"file" | "url" | "context">("file");
  const [urlValue, setUrlValue] = useState("");
  const [contextValue, setContextValue] = useState("");
  const [urlError, setUrlError] = useState("");
  const [contextError, setContextError] = useState("");
  const [uploading, setUploading] = useState(false);

  const generateUploadUrl = useMutation(api.evidence.generateUploadUrl);
  const createFileEvidence = useMutation(api.evidence.createFileEvidence);
  const createUrlEvidence = useMutation(api.evidence.createUrlEvidence);
  const createSoftContextEvidence = useMutation(api.evidence.createSoftContextEvidence);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
      await createFileEvidence({ profileId, claimId, storageId, fileName: file.name });
      onSubmit();
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    setUrlError("");
    try {
      const parsed = new URL(urlValue);
      if (!parsed.protocol.startsWith("http")) throw new Error();
    } catch {
      setUrlError("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setUploading(true);
    await createUrlEvidence({ profileId, claimId, url: urlValue });
    setUploading(false);
    onSubmit();
  };

  const handleContextSubmit = async () => {
    setContextError("");
    if (contextValue.trim().length < 20) {
      setContextError("Please provide at least 20 characters of context.");
      return;
    }
    setUploading(true);
    await createSoftContextEvidence({ profileId, claimId, context: contextValue });
    setUploading(false);
    onSubmit();
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "file" | "url" | "context")}>
        <TabsList className="w-full">
          <TabsTrigger value="file" className="flex-1 gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="flex-1 gap-1.5">
            <Link className="w-3.5 h-3.5" /> Paste URL
          </TabsTrigger>
          <TabsTrigger value="context" className="flex-1 gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Add Context
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
            <Upload className="w-8 h-8 text-gray-300" />
            <span className="text-sm text-gray-500">Click to select a file</span>
            <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
          {uploading && <p className="text-sm text-center text-blue-600 mt-2">Uploading…</p>}
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-3">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {urlError && <p className="text-red-600 text-sm">{urlError}</p>}
            <button
              onClick={handleUrlSubmit}
              disabled={!urlValue || uploading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Save URL
            </button>
          </div>
        </TabsContent>

        <TabsContent value="context">
          <div className="space-y-3">
            <textarea
              value={contextValue}
              onChange={(e) => setContextValue(e.target.value)}
              rows={4}
              placeholder="e.g. 'I can share more details in person' or describe the context privately"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {contextError && <p className="text-red-600 text-sm">{contextError}</p>}
            <button
              onClick={handleContextSubmit}
              disabled={!contextValue || uploading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Save Context
            </button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 underline">
          Skip this claim
        </button>
      </div>
    </div>
  );
}
