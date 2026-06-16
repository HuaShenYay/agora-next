// ====================
// ReaderProgress — 顶部 fixed 进度条
// 接收父组件传入的 progress，不再自行监听 scroll
// ====================

"use client";

interface Props {
  progress?: number;
}

export default function ReaderProgress({ progress = 0 }: Props) {
  return (
    <div className="reader-progress" aria-hidden>
      <div
        className="reader-progress-bar"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
