"use client";

import { useEffect, useState } from "react";
import SectionHeading from "../../components/SectionHeading";
import SideWings from "../../components/SideWings";
import { api } from "../../lib/api";

export default function ResourcesPage() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    api.get("/documents").then(({ data }) => setDocuments(data.documents || [])).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading eyebrow="Resources" title="Circulars, Acts & Legal Documents" />
      <SideWings documents={documents} />
    </div>
  );
}
