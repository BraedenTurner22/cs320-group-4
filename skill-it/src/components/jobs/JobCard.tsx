"use client";

import type { Job } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import Link from "next/link";

type JobCardProps = {
  job: Job;
  posterName?: string;
  posterAvatar?: string | null;
  showApplicantBadge?: boolean;
};

export default function JobCard({
  job,
  posterName,
  posterAvatar,
  showApplicantBadge = false,
}: JobCardProps) {
  const applicantCount = job.pending_requests?.length ?? 0;
  const showBadge = showApplicantBadge && applicantCount > 0;

  return (
    <div className="relative h-full">
      {/* Applicant notification badge */}
      {showBadge && (
        <div className="absolute -top-2 -right-2 z-10 min-w-[22px] h-[22px] rounded-full bg-ember flex items-center justify-center shadow-md shadow-ember/40 pointer-events-none">
          <span className="text-[10px] font-bold text-white leading-none px-1">
            {applicantCount}
          </span>
        </div>
      )}

      <Card hover className="h-full">
        <div className="flex flex-col h-full gap-3">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-fg leading-snug line-clamp-2">
              {job.title || `Job #${job.id}`}
            </h3>
            <Badge color={job.completed ? "muted" : "green"}>
              {job.completed ? "Completed" : "Open"}
            </Badge>
          </div>

          {/* Category */}
          {job.category && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted/70 font-medium shrink-0">Category:</span>
              <Badge color="orange">{job.category.name}</Badge>
            </div>
          )}

          {/* Skills */}
          {job.associated_skills && job.associated_skills.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted/70 font-medium shrink-0 pt-0.5">Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {job.associated_skills.map((s, i) => (
                  <Badge key={s.id ?? `skill-${i}`} color="dim">
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description — grows to fill remaining space */}
          <p className="flex-1 text-sm text-muted line-clamp-3 leading-relaxed">
            {job.description}
          </p>

          {/* Footer — always at bottom */}
          <div className="flex items-center justify-between pt-2 border-t border-edge/50">
            {posterName ? (
              <div className="flex items-center gap-1.5">
                <ProfileAvatar name={posterName} imageUrl={posterAvatar} size="sm" />
                <span className="text-xs text-muted/60">{posterName}</span>
              </div>
            ) : (
              <span className="text-xs text-muted/60">{`#${job.posted_by}`}</span>
            )}
            <Link href={`/jobs/${job.id}`}>
              <Button variant="secondary" className="text-xs px-3 py-1.5">
                View
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
