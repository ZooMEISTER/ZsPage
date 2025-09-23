// src/pages/blog/BlogDetailPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { touristRequest } from "../../util/request";
import { useTranslation } from "react-i18next";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import "highlight.js/styles/atom-one-dark.css";

// 直接复用助手页样式（你之前就有）
import "./BlogDetailPage.css";

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 992px)"); // 992 以下隐藏目录
  const { t } = useTranslation();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 正文容器 ref（用于扫描标题和滚动定位）
  const contentRef = useRef(null);
  const [toc, setToc] = useState([]); // {id, text, level}
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr("");

    touristRequest
      .get("/blog/get-blog-detail", { params: { id } })
      .then((res) => {
        const data = res?.data?.data;
        const item = Array.isArray(data) ? data[0] : data;
        setDetail(item || null);
        window.scrollTo({ top: 0, behavior: "instant" });
      })
      .catch((e) => setErr(e?.message || "加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  // 渲染完成后，基于 DOM 抽取目录（h1~h3）
  useEffect(() => {
    if (!detail?.blog_content) {
      setToc([]);
      return;
    }
    const el = contentRef.current;
    if (!el) return;

    const hs = el.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const items = Array.from(hs).map((h) => ({
      id: h.id,
      text: h.textContent?.trim() || "",
      level: Number(h.tagName.substring(1)), // 1/2/3
      offsetTop: h.getBoundingClientRect().top + window.scrollY,
    }));
    setToc(items);

    // scroll spy
    const onScroll = () => {
      const scrollY = window.scrollY + 100; // 提前量
      let cur = "top"; // 默认 top
      for (const it of items) {
        if (scrollY >= it.offsetTop) cur = it.id;
        else break;
      }
      setActiveId(cur);
    };    
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 监听尺寸变化，更新 offsetTop
    const onResize = () => {
      const updated = Array.from(el.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => ({
        id: h.id,
        text: h.textContent?.trim() || "",
        level: Number(h.tagName.substring(1)),
        offsetTop: h.getBoundingClientRect().top + window.scrollY,
      }));
      setToc(updated);
      setTimeout(() => onScroll(), 0);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [detail?.blog_content]);

  // 点击目录项，平滑滚动
  const handleTocClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80; // 顶部留白
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const pageStyle = {
    maxWidth: 960,
    margin: "0 auto",
    padding: isMobile ? "16px 12px 48px" : "24px 16px 80px",
    backgroundColor: "#1A1A1A",
    minHeight: "calc(100vh - 60px)",
    position: "relative",
  };

  const titleStyle = {
    margin: "8px 0 6px",
    fontSize: isMobile ? 22 : 28,
    fontWeight: 800,
    lineHeight: 1.25,
    color: "#ff8b00",
  };

  const metaStyle = {
    color: "#999",
    fontSize: isMobile ? 12 : 13,
    marginBottom: isMobile ? 12 : 16,
  };

  if (loading) return <div style={pageStyle}>加载中...</div>;
  if (err) return <div style={pageStyle}>加载失败：{err}</div>;
  if (!detail) return <div style={pageStyle}>未找到该文章</div>;

  return (
    <div style={pageStyle}>
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        style={{
          border: "1px solid #FF0000",
          background: "rgb(36,36,36)",
          color: "#fff",
          borderRadius: 8,
          padding: "6px 10px",
          cursor: "pointer",
          marginTop: 50,
          marginBottom: 12,
        }}
      >
        ◀ {t("BACK")}
      </button>

      {/* 标题与时间 */}
      <h1 style={titleStyle}>{detail.blog_title || "无标题"}</h1>
      <div style={metaStyle}>发布于：{fmtDate(detail.created_time)}</div>

      {/* 正文（保持和助手页一致的写法） */}
      <div ref={contentRef} className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            // 给标题自动生成 id（目录要用）
            rehypeSlug,
            // 给标题加一个锚点链接（小链条图标可选）
            [rehypeAutolinkHeadings, { behavior: "append" }],
            // 代码高亮（和助手页一致）
            [rehypeHighlight, { detect: true }],
          ]}
        >
          {detail.blog_content || "（无内容）"}
        </ReactMarkdown>
      </div>

      {/* 右侧固定目录（桌面端显示） */}
      {!isMobile && toc.length > 0 && (
        <nav className="toc-fixed">
          <div className="toc-card">
            <div className="toc-title">{t("CONTENTS")}</div>
            <ul className="toc-list">
              {/* 顶部文章标题 */}
              <li
                className={`toc-item level-0 ${activeId === "top" ? "active" : ""}`}
              >
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {detail.blog_title || "无标题"}
                </a>
              </li>

              {/* 其余标题项 */}
              {toc.map((it, i) => (
                <li
                  key={i}
                  className={`toc-item level-${it.level} ${
                    activeId === it.id ? "active" : ""
                  }`}
                >
                  <a href={`#${it.id}`} onClick={(e) => handleTocClick(e, it.id)}>
                    {it.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
};

export default BlogDetailPage;
