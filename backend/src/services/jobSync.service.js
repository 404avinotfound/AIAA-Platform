const axios = require("axios");
const cron = require("node-cron");
const Job = require("../models/Job");

const NCS_API_URL = process.env.NCS_API_URL || "https://betacloud.ncs.gov.in/api/v1/job-posts/search";

const NCS_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Origin: "https://betacloud.ncs.gov.in",
  Referer: "https://betacloud.ncs.gov.in/job-listing?isGovernmentJob=true",
  "User-Agent": "Mozilla/5.0 (AIAA-JobSync/1.0)",
};

// Maps a raw NCS job-post record onto our internal Job schema.
// NCS's response field names have varied across deployments, so we
// defensively read a few possible field names for each value.
function normalizeJob(raw) {
  return {
    sourceJobId: String(raw.id ?? raw.jobId ?? raw._id ?? ""),
    title: raw.jobTitle || raw.title || "Untitled Government Job",
    organization: raw.organizationName || raw.organization || "",
    description: raw.jobDescription || raw.description || "",
    vacancies: raw.noOfVacancies ?? raw.vacancies ?? null,
    location: Array.isArray(raw.jobLocations)
      ? raw.jobLocations
      : raw.jobLocations
      ? [raw.jobLocations]
      : [],
    education: Array.isArray(raw.educationPreferences) ? raw.educationPreferences : [],
    minAge: raw.minAge ?? null,
    maxAge: raw.maxAge ?? null,
    minSalary: raw.minSalary ?? null,
    maxSalary: raw.maxSalary ?? null,
    skills: Array.isArray(raw.requiredSkills) ? raw.requiredSkills : [],
    applyLink: raw.externalLink || raw.applyLink || "",
    jobType: raw.jobType || "",
    isGovernmentJob: raw.isGovernmentJob !== undefined ? Boolean(raw.isGovernmentJob) : true,
    publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : new Date(),
    expiresAt: raw.expiredAt ? new Date(raw.expiredAt) : null,
    isManual: false,
  };
}

// Fetches one page from the NCS job-posts search endpoint.
async function fetchPage(page, size = 20) {
  const response = await axios.post(
    `${NCS_API_URL}?page=${page}&size=${size}`,
    { sortBy: "RELEVANCE", isGovernmentJob: "true" },
    { headers: NCS_HEADERS, timeout: 15000 }
  );

  // NCS has been seen wrapping results either directly or under `data`.
  const body = response.data?.data ?? response.data ?? {};
  const content = body.content ?? body.data ?? [];
  const isLast = body.last ?? content.length === 0;

  return { content, isLast };
}

// Fetches every page from NCS and upserts each job into MongoDB.
// Safe to call repeatedly; existing jobs are matched on sourceJobId.
async function syncGovernmentJobs({ maxPages = 50 } = {}) {
  let page = 0;
  let totalSynced = 0;

  while (page < maxPages) {
    let content, isLast;
    try {
      ({ content, isLast } = await fetchPage(page));
    } catch (err) {
      console.error(`Job sync failed on page ${page}:`, err.message);
      break;
    }

    if (!content || content.length === 0) break;

    for (const raw of content) {
      const normalized = normalizeJob(raw);
      if (!normalized.sourceJobId) continue;

      await Job.findOneAndUpdate(
        { sourceJobId: normalized.sourceJobId },
        normalized,
        { upsert: true, new: true }
      );
      totalSynced += 1;
    }

    if (isLast) break;
    page += 1;
  }

  console.log(`Government job sync complete. ${totalSynced} jobs upserted.`);
  return totalSynced;
}

// Schedules the recurring sync job (defaults to every 6 hours).
function scheduleJobSync() {
  const schedule = process.env.JOB_SYNC_CRON || "0 */6 * * *";
  cron.schedule(schedule, () => {
    console.log("Running scheduled government job sync...");
    syncGovernmentJobs().catch((err) => console.error("Scheduled job sync error:", err));
  });
  console.log(`Government job sync scheduled with cron pattern "${schedule}"`);
}

module.exports = { syncGovernmentJobs, scheduleJobSync };
