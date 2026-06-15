// ====================
// BookUploaderCard — 详情页「上传者」卡片
// ====================

import type { Profile } from "@/lib/db/profiles";

interface Props {
  profile: Profile | null;
  uploadedAt: string;
  booksCount: number;
  isAnonymous: boolean;
}

export default function BookUploaderCard({ profile, uploadedAt, booksCount, isAnonymous }: Props) {
  return (
    <div className="bd-actions-card bd-uploader">
      <div className="bd-actions-card-head">上传者</div>
      <div className="bd-uploader-body">
        {profile?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt={profile.displayName} className="bd-uploader-avatar" />
        ) : (
          <div className="bd-uploader-avatar bd-uploader-avatar--placeholder">
            {(profile?.displayName ?? "A").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="bd-uploader-info">
          <div className="bd-uploader-name">{profile?.displayName ?? (isAnonymous ? "匿名" : "未知")}</div>
          {profile?.bio ? (
            <p className="bd-uploader-bio">{profile.bio}</p>
          ) : (
            <p className="bd-uploader-bio bd-uploader-bio--empty">这位上传者还没写自我介绍</p>
          )}
        </div>
      </div>
      <dl className="bd-uploader-stats">
        <div className="bd-uploader-stat">
          <dt>上传日期</dt>
          <dd>{new Date(uploadedAt).toISOString().slice(0, 10)}</dd>
        </div>
        <div className="bd-uploader-stat">
          <dt>藏书</dt>
          <dd>{String(booksCount).padStart(2, "0")}</dd>
        </div>
      </dl>
    </div>
  );
}
