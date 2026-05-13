export const helpStatuses = ["SUBMITTED", "TRIAGED", "CLOSED", "DRAFT"];
export const severities = ["", "LOW", "MEDIUM", "HIGH", "IMMEDIATE_DANGER"];
export const chatStatuses = ["OPEN", "CLOSED", "EXPIRED"];

export function formatDate(value: Date | string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function shortId(id: string) {
  return id.slice(0, 8);
}

export function statusTone(status: string) {
  if (status === "IMMEDIATE_DANGER" || status === "HIGH" || status === "SUBMITTED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "TRIAGED" || status === "OPEN" || status === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "CLOSED" || status === "LOW") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  return "border-zinc-200 bg-zinc-100 text-zinc-700";
}

export function HiddenAdminKey({ value }: { value: string }) {
  return <input type="hidden" name="adminKey" value={value} />;
}

export function HiddenReturnTo({ value }: { value: string }) {
  return <input type="hidden" name="returnTo" value={value} />;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="grid gap-4 border-b border-zinc-200 pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-zinc-800">
      {label}
      <input
        className="min-h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  required = false,
  rows = 3,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-zinc-800">
      {label}
      <textarea
        className="min-h-24 rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
      />
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  options: { label: string; value: string }[];
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-zinc-800">
      {label}
      <select
        className="min-h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        name={name}
        required={required}
        defaultValue={defaultValue ?? undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="min-h-11 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
      type="submit"
    >
      {children}
    </button>
  );
}
