import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type RoleDoc = {
  _id: Id<"roles">;
  title: string;
  company: string;
};

interface Props {
  profileId: Id<"profiles">;
  roles: RoleDoc[];
  onCreated: () => void;
  onCancel: () => void;
}

export function ReferenceForm({ profileId, roles, onCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<Id<"roles">[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const createReference = useMutation(api.references.createReference);
  const sendInvite = useAction(api.references.sendInvite);

  const toggleRole = (id: Id<"roles">) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !relationship || submitting) return;
    setSubmitting(true);
    try {
      const { referenceId } = await createReference({
        profileId,
        name,
        email,
        relationship,
        linkedRoleIds: selectedRoleIds,
      });
      await sendInvite({ referenceId });
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-xl bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
        <input
          type="text"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="e.g. Manager at Acme, Peer at Startup"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {roles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles they can speak to
          </label>
          <div className="space-y-1.5">
            {roles.map((role) => (
              <label key={role._id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selectedRoleIds.includes(role._id)}
                  onChange={() => toggleRole(role._id)}
                  className="rounded border-gray-300"
                />
                <span>{role.title} at {role.company}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !name || !email || !relationship}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {submitting ? "Sending…" : "Send Invite"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
