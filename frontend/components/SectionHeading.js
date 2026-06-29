export default function SectionHeading({ eyebrow, title, align = "center", light = false }) {
  const alignment = align === "left" ? "items-start text-left" : "items-center text-center";
  return (
    <div className={`mb-10 flex flex-col ${alignment}`}>
      {eyebrow && <p className={`eyebrow mb-2 ${light ? "text-gold-light" : "text-gold-dim"}`}>{eyebrow}</p>}
      <h2 className={`font-serif text-3xl font-bold sm:text-4xl ${light ? "text-cream" : "text-navy"}`}>{title}</h2>
      <div className="laurel-divider mt-4">
        <span className="laurel-dot" />
      </div>
    </div>
  );
}
