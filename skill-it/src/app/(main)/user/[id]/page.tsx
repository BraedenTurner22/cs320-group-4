import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

import { profile as profileService } from '@/lib/services/profile'; 
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveProfilePictureSignedUrl } from '@/lib/profile-picture-signed-url';
import { UserProfile, Job, MappedReview } from "@/types";
import { jobs as jobsService } from '@/lib/services/jobs';
import { reviews as reviewsService } from '@/lib/services/reviews';

// Simple Star SVG for the reviews
const StarIcon = () => (
  <svg className="w-4 h-4 text-ember" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default async function PublicProfileView({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);
  
  if (isNaN(userId)) return <UserNotFound />;

  let userProfile: UserProfile | null = null;
  let secureAvatarUrl: string | null = null;
  let mappedSkills: string[] = [];
  let postedJobs: Job[] = [];
  let joinedJobs: Job[] = [];
  let mappedReviews: MappedReview[] = [];
  let averageRating: number = 0;
  let reviewCount:number  = 0;

  try {
    userProfile = await profileService.getByID(userId);
    const fetchedSkills = await profileService.getSkills(userId) as { name: string }[];
    
    postedJobs = await jobsService.getPostedByUserId(userId);
    joinedJobs = await jobsService.getJoinedByUserId(userId);
    mappedReviews = await reviewsService.getReviewsAboutSubject(userId);
    
    const adminSupabase = createAdminClient();
    secureAvatarUrl = await resolveProfilePictureSignedUrl(adminSupabase, userProfile.profile_picture);

    mappedSkills = Array.isArray(fetchedSkills) 
      ? fetchedSkills.map((s) => s.name).filter(Boolean)
      : [];

    reviewCount = mappedReviews.length;
    averageRating = reviewCount > 0 
      ? mappedReviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount 
      : 0;

  } catch {
    return <UserNotFound />;
  }

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto flex flex-col gap-8">
    {/* PROFILE */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-8 rounded-2xl border border-edge/60 bg-raised/80 backdrop-blur-xl shadow-sm">
        <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0">
          <Image
            src={secureAvatarUrl || "/skillit_logo.png"} 
            alt={`${userProfile.Username || 'User'}'s avatar`}
            fill
            className="rounded-full object-cover border-4 border-surface shadow-md bg-white"
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-fg">
            {userProfile.Username}
          </h1>
          <p className="text-ember font-semibold mt-1">
            {userProfile.Major} {userProfile.Graduation_Year ? `'${String(userProfile.Graduation_Year).slice(-2)}` : ''}
          </p>
          <p className="text-muted mt-3 max-w-2xl leading-relaxed">
            {userProfile.Description || "This user hasn't written a bio yet."}
          </p>
        </div>

        <div className="flex gap-8 w-full md:w-auto shrink-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-edge/60 md:pl-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-fg leading-none">
                {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
              </span>
              <StarIcon />
            </div>
            <span className="text-[10px] text-muted uppercase tracking-wider font-bold mt-1">Rating</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-fg leading-none">{postedJobs.length + joinedJobs.length}</span>
            <span className="text-[10px] text-muted uppercase tracking-wider font-bold mt-1">Gigs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-fg leading-none">{reviewCount}</span>
            <span className="text-[10px] text-muted uppercase tracking-wider font-bold mt-1">Reviews</span>
          </div>
        </div>
      </div>

      {/* SKILLS */}
      {mappedSkills.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-fg tracking-tight">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {mappedSkills.map((skill: string, index: number) => (
              <span key={index} className="px-4 py-1.5 rounded-full text-sm font-bold bg-ember/10 text-ember border border-ember/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* JOBS & REVIEWS*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* LEFT: JOBS */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <section>
            <h2 className="text-xl font-bold text-fg tracking-tight mb-4 flex items-center justify-between">
              Jobs Posted
              <span className="text-sm font-normal text-muted bg-raised px-2 py-1 rounded-md border border-edge">
                {postedJobs.length} total
              </span>
            </h2>
            {postedJobs.length > 0 ? (
              <div className="grid gap-3">
                {postedJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-edge bg-surface flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-fg">{job.title}</h3>
                      <p className="text-sm text-muted mt-1">
                        {job.pending_requests ? job.pending_requests.length : 0} applicant(s)
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${job.completed ? 'bg-edge text-muted' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                      {job.completed ? 'Completed' : 'Open'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-edge bg-transparent text-center">
                <p className="text-muted italic text-sm">No jobs posted yet.</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-fg tracking-tight mb-4 flex items-center justify-between">
              Jobs Joined
              <span className="text-sm font-normal text-muted bg-raised px-2 py-1 rounded-md border border-edge">
                {joinedJobs.length} total
              </span>
            </h2>
            {joinedJobs.length > 0 ? (
              <div className="grid gap-3">
                {joinedJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-edge bg-surface flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-fg">{job.title}</h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {job.completed ? 'Completed' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-edge bg-transparent text-center">
                <p className="text-muted italic text-sm">No jobs joined yet.</p>
              </div>
            )}
          </section>

        </div>

        {/* RIGHT: REVIEWS */}
        <div className="lg:col-span-1">
          <section className="sticky top-24">
            <h2 className="text-xl font-bold text-fg tracking-tight mb-4">Reviews</h2>
            {mappedReviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {mappedReviews.map((review, i) => (
                  <div key={i} className="p-5 rounded-xl border border-edge bg-surface shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-fg">{review.authorName}</span>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <StarIcon key={i} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      &quot;{review.text}&quot;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-edge bg-transparent text-center">
                <p className="text-muted italic text-sm">No reviews yet.</p>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}

function UserNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center p-8 rounded-2xl border border-edge/60 bg-raised/80 shadow-sm">
        <h2 className="text-2xl font-bold text-fg mb-2">User Not Found</h2>
        <p className="text-muted mb-6 max-w-sm">The profile you are looking for does not exist or has been removed.</p>
        <Link href="/dashboard">
          <Button className="!bg-ember !text-white hover:!bg-ember/90 border-transparent font-bold">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}