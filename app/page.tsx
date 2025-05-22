"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const categories = [
  "정치",
  "영토갈등",
  "사회정의",
  "지방행정",
  "노동운동",
];

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

function parseSections(content: string) {
  // 이모지+제목+내용 패턴 추출 (예: 🪂일상생활: ...)
  const regex = /([🪂💲⛪📦⚖️🌾🗳️🗺️]+)([^:]+):([^💲⛪🪂📦⚖️🌾🗳️🗺️]+)/g;
  let match, sections = [];
  while ((match = regex.exec(content)) !== null) {
    sections.push({
      icon: match[1].trim(),
      title: match[2].trim(),
      desc: match[3].trim()
    });
  }
  return sections;
}

function removeSectionLines(text: string) {
  // 이모지+제목: 으로 시작하는 줄 제거
  return text.replace(/^([🪂💲⛪📦⚖️🌾🗳️🗺️]+)[^:]+:.*$/gm, '').replace(/\n{2,}/g, '\n').trim();
}

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [popupOpenIdx, setPopupOpenIdx] = useState<number|null>(null);

  useEffect(() => {
    fetch(
      "https://script.google.com/macros/s/AKfycbwky8cxRYdrK0Ar5uATeALQLlisoJZQb-epy-RwXE8KS4cCbCoeQvIVd58qa9m4LYDFrQ/exec"
    )
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  const featuredPosts = posts.slice(0, 2);
  const recentPosts = posts.slice(2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-[340px] md:h-[400px] flex items-center justify-center text-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            매일매일 새로운 종목투자 뉴스 
          </h1>
          <p className="text-lg md:text-xl text-white mb-6 drop-shadow">
            We travel the world in search of stories. Come along for the ride.
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded shadow transition">
            View Latest Posts
          </button>
        </div>
      </div>
      {/* Category Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-4 py-4">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className="text-gray-700 hover:text-orange-500 font-medium px-3 py-1 transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* Featured Posts */}
      <div className="max-w-5xl mx-auto mt-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredPosts.map((post, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-2xl shadow-md cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:z-10"
              onClick={() => {
                const sections = parseSections(post["내용"]);
                let mainText = post["본문"] || post["내용"];
                const mainTextWithoutSections = removeSectionLines(mainText);
                let html = '';
                if (mainTextWithoutSections) {
                  html += `<div style='margin-bottom:12px;white-space:pre-line;text-align:left;'>${mainTextWithoutSections}</div>`;
                }
                sections.forEach(sec => {
                  html += `<div style="margin-bottom:6px;font-size:1.05em;">
                    <span style="font-size:1.2em;margin-right:4px;vertical-align:middle;">${sec.icon}</span>
                    <b>${sec.title}</b>: ${sec.desc}
                  </div>`;
                });
                if (post["출처"]) {
                  html += `<div style='margin-top:1em;'><a href='${post["출처"]}' target='_blank' style='color:#3085d6;text-decoration:underline;'>원문 보기</a></div>`;
                }
                setPopupOpenIdx(idx);
                Swal.fire({
                  title: post["제목"],
                  html,
                  icon: 'info',
                  confirmButtonText: '닫기',
                  showCancelButton: !!post["출처"],
                  cancelButtonText: '뉴스기사',
                  width: 700,
                  background: '#f6f7f8',
                  didClose: () => setPopupOpenIdx(null),
                  preConfirm: () => {},
                  preDeny: () => {},
                }).then((result) => {
                  if (result.dismiss === Swal.DismissReason.cancel && post["출처"]) {
                    window.open(post["출처"], '_blank');
                  }
                });
              }}
            >
              {/* 카테고리 태그 좌측 상단 */}
              <span className="absolute top-3 left-3 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
                {post["카테고리"]}
              </span>
              {/* 날짜 우측 상단 */}
              <span className="absolute top-3 right-3 text-xs text-gray-500 font-semibold bg-white/80 px-2 py-1 rounded">
                {formatDate(post["날짜"])}
              </span>
              {/* 이모지 */}
              <div className="flex flex-col items-center justify-center pt-10 pb-2">
                <div className="text-6xl mb-2 select-none">
                  {post["이모지"] || "📰"}
                </div>
                {/* 제목 */}
                <div className="text-lg font-bold text-gray-900 text-center px-2 mb-2 line-clamp-2">
                  {post["제목"]}
                </div>
              </div>
              {/* 내용 일부 미리보기 */}
              <div className="px-4 text-gray-600 text-sm line-clamp-2 text-center mb-8">
                {post["내용"]}
              </div>
              {/* 출처 링크(카드 하단) - 팝업이 열려있지 않을 때만 표시, 항상 카드 하단 중앙에 고정 */}
              {popupOpenIdx !== idx && post["출처"] && (
                <div className="absolute bottom-3 left-0 w-full flex justify-center">
                  <a href={post["출처"]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline hover:text-blue-700 transition">
                    원문 보기
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Most Recent */}
      <div className="max-w-5xl mx-auto mt-14 px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Most Recent</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentPosts.map((post, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-2xl shadow-md cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:z-10"
              onClick={() => {
                const sections = parseSections(post["내용"]);
                let mainText = post["본문"] || post["내용"];
                const mainTextWithoutSections = removeSectionLines(mainText);
                let html = '';
                if (mainTextWithoutSections) {
                  html += `<div style='margin-bottom:12px;white-space:pre-line;text-align:left;'>${mainTextWithoutSections}</div>`;
                }
                sections.forEach(sec => {
                  html += `<div style="margin-bottom:6px;font-size:1.05em;">
                    <span style="font-size:1.2em;margin-right:4px;vertical-align:middle;">${sec.icon}</span>
                    <b>${sec.title}</b>: ${sec.desc}
                  </div>`;
                });
                if (post["출처"]) {
                  html += `<div style='margin-top:1em;'><a href='${post["출처"]}' target='_blank' style='color:#3085d6;text-decoration:underline;'>원문 보기</a></div>`;
                }
                setPopupOpenIdx(idx);
                Swal.fire({
                  title: post["제목"],
                  html,
                  icon: 'info',
                  confirmButtonText: '닫기',
                  showCancelButton: !!post["출처"],
                  cancelButtonText: '뉴스기사',
                  width: 700,
                  background: '#f6f7f8',
                  didClose: () => setPopupOpenIdx(null),
                  preConfirm: () => {},
                  preDeny: () => {},
                }).then((result) => {
                  if (result.dismiss === Swal.DismissReason.cancel && post["출처"]) {
                    window.open(post["출처"], '_blank');
                  }
                });
              }}
            >
              {/* 카테고리 태그 좌측 상단 */}
              <span className="absolute top-3 left-3 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
                {post["카테고리"]}
              </span>
              {/* 날짜 우측 상단 */}
              <span className="absolute top-3 right-3 text-xs text-gray-500 font-semibold bg-white/80 px-2 py-1 rounded">
                {formatDate(post["날짜"])}
              </span>
              {/* 이모지 */}
              <div className="flex flex-col items-center justify-center pt-10 pb-2">
                <div className="text-6xl mb-2 select-none">
                  {post["이모지"] || "📰"}
                </div>
                {/* 제목 */}
                <div className="text-lg font-bold text-gray-900 text-center px-2 mb-2 line-clamp-2">
                  {post["제목"]}
                </div>
              </div>
              {/* 내용 일부 미리보기 */}
              <div className="px-4 text-gray-600 text-sm line-clamp-2 text-center mb-8">
                {post["내용"]}
              </div>
              {/* 출처 링크(카드 하단) - 팝업이 열려있지 않을 때만 표시, 항상 카드 하단 중앙에 고정 */}
              {popupOpenIdx !== idx && post["출처"] && (
                <div className="absolute bottom-3 left-0 w-full flex justify-center">
                  <a href={post["출처"]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline hover:text-blue-700 transition">
                    원문 보기
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
