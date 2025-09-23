import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { touristRequest } from "../../util/request";
import { useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

const styles = {
    page: {
        maxWidth: 960,
        margin: "0 auto",
        // padding: "24px 16px 80px",
        paddingTop: "10px",
        paddingBottom: "40px",
        paddingLeft: "10px",
        paddingRight: "10px",
        backgroundColor: "rgb(26, 26, 26)",
        minHeight: "calc(100vh - 130px)"
    },
    header: { margin: "0 0 8px" },
    sub: { color: "#777", fontSize: 14, marginBottom: 16, marginTop: "60px" },
    monthTitle: {
        margin: "28px 0 12px",
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1.3,
        color: "red"
    },
    list: { display: "flex", flexDirection: "column", gap: 12 },
    card: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        border: "1px solid #FF0000",
        borderRadius: 12,
        padding: 24,
        background: "rgb(36, 36, 36)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        transition: "transform .15s ease, box-shadow .15s ease",
    },
    cardHover: {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    },
    cardContent: { flex: 1, minWidth: 0 }, // 让文本区域可收缩以出现省略
    titleRow: {
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        flexWrap: "wrap",
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        margin: 0,
        lineHeight: 1.4,
        color: "#ff8b00"
    },
    date: { fontSize: 12, color: "#999" },
    excerpt: {
        marginTop: 10,
        fontSize: 14,
        color: "#555",
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: 1, // 显示 2 行，超出省略
        overflow: "hidden",
        wordBreak: "break-word",
    },
    empty: { padding: "48px 0", color: "#999", textAlign: "center" },
};

function monthKeyOf(dateStr) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}-${String(m).padStart(2, "0")}`; // 2025-09
}
function monthHeading(key) {
    const [y, m] = key.split("-");
    return `${y}.${parseInt(m, 10)}`;
}
function fmtDate(dateStr) {
    const d = new Date(dateStr); // 浏览器会用本地时区显示
    return d.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}
function toPlainText(s = "") {
  // 若后端未来给到 HTML，可粗暴去标签
  return String(s).replace(/<[^>]+>/g, "");
}

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoverId, setHoverId] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { t } = useTranslation();


    useEffect(() => {
        touristRequest
        .get("/blog/get-blogs")
        .then((res) => {
            const list = Array.isArray(res?.data?.data) ? res.data.data : [];
            setBlogs(list);
            setLoading(false);
        })
        .catch((err) => {
            setError(err?.message || "请求失败");
            setLoading(false);
        });
    }, []);

    // 时间从新到旧
    const sorted = useMemo(() => {
        return [...blogs].sort(
        (a, b) =>
            new Date(b.created_time).getTime() -
            new Date(a.created_time).getTime()
        );
    }, [blogs]);

    // 按月份分组：Map<"2025-09", Blog[]>
    const groups = useMemo(() => {
        const m = new Map();
        for (const it of sorted) {
        const k = monthKeyOf(it.created_time);
        if (!m.has(k)) m.set(k, []);
        m.get(k).push(it);
        }
        return m;
    }, [sorted]);

    if (loading) return <div style={styles.page}>加载中...</div>;
    if (error) return <div style={styles.page}>加载失败：{error}</div>;
    if (!sorted.length) return <div style={styles.empty}>暂无博客</div>;

    return (
        <div style={styles.page}>
            <div style={{...styles.sub, marginTop: isMobile ? "60px" : "60px"}}>{t("TOTAL")} {sorted.length} {t("BLOGS")}</div>

            {[...groups.entries()].map(([monthKey, items]) => (
                <section key={monthKey}>
                <h2 style={styles.monthTitle}>{monthHeading(monthKey)}</h2>
                <div style={styles.list}>
                    {items.map((blog) => {
                    const isHover = hoverId === blog.id;
                    const content = toPlainText(blog.blog_content || "");
                    return (
                        <article
                            key={blog.id}
                            style={{ ...styles.card, ...(isHover ? styles.cardHover : null), cursor: "pointer", }}
                            onMouseEnter={() => setHoverId(blog.id)}
                            onMouseLeave={() => setHoverId(null)}
                            onClick={() => navigate(`/blog/${blog.id}`)}
                        >
                        {/* 如果未来要放缩略图或标签，可在这里的左侧插入一个小方块 */}
                        <div style={styles.cardContent}>
                            <div style={styles.titleRow}>
                            <h3 style={styles.title}>{blog.blog_title || "无标题"}</h3>
                            <span style={styles.date}>{fmtDate(blog.created_time)}</span>
                            </div>
                            <div style={styles.excerpt}>
                            {content && content.length > 0
                                ? content
                                : "（暂无内容）"}
                            </div>
                        </div>
                        </article>
                    );
                    })}
                </div>
                </section>
            ))}
        </div>
    );
};

export default BlogPage;
