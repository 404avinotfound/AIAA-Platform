import Link from "next/link";
import { Scale, ArrowRight } from "lucide-react";

export default function WingCard({ wing }) {
  return (
    <Link
      href={`/wings/${wing.slug}`}
      className="card-official group flex flex-col rounded-lg p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-gold">
        <Scale size={20} />
      </div>
      <h3 className="font-serif text-lg font-bold text-navy">{wing.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-ink/65">{wing.purpose}</p>
      <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-gold-dim group-hover:text-maroon">
        Learn more <ArrowRight size={14} />
      </span>
    </Link>
  );
}
