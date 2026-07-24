import { STATE_PROTECTIONS } from "@/lib/ai/stateProtections";

export function StateDeadlinesTable() {
  const states = Object.values(STATE_PROTECTIONS).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-muted">
            <th className="pb-2 font-medium">State</th>
            <th className="pb-2 font-medium">Appeal Deadline</th>
            <th className="pb-2 font-medium">Surprise Billing</th>
            <th className="pb-2 font-medium">Balance Billing</th>
          </tr>
        </thead>
        <tbody>
          {states.map((s) => (
            <tr key={s.state} className="border-b border-gray-100">
              <td className="py-2 font-medium text-ink">{s.name}</td>
              <td className="py-2 text-muted">{s.appealDeadlineDays} days</td>
              <td className="py-2 text-muted">{s.surpriseBilling}</td>
              <td className="py-2 text-muted">{s.balanceBilling}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">Sources: CMS state surprise billing profiles, NAIC model acts, state legislation. Data may not reflect recent legislative changes. Verify with your state insurance department.</p>
    </div>
  );
}
