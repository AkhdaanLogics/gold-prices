// src/components/GoldNews.tsx

"use client";

import { useState, useEffect } from "react";
import { Newspaper, ExternalLink } from "lucide-react";

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
}

export default function GoldNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Call our secure API route instead of direct API call
        const response = await fetch("/api/news");

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.articles) {
            setNews(data.articles);
          } else {
            setNews(getMockNews());
          }
        } else {
          // Fallback to mock data if API fails
          setNews(getMockNews());
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews(getMockNews());
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getMockNews = (): NewsArticle[] => [
    {
      title: "Gold Prices Rise Amid Economic Uncertainty",
      url: "#",
      source: "Financial Times",
      publishedAt: new Date().toISOString(),
      description: "Gold sees gains as investors seek safe haven assets",
    },
    {
      title: "Central Banks Increase Gold Reserves",
      url: "#",
      source: "Bloomberg",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      description: "Global central banks continue accumulating gold",
    },
    {
      title: "Gold Market Analysis: What's Next?",
      url: "#",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      description: "Analysts predict continued volatility in precious metals",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card-gold p-4">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-gradient-gold" />
          <h3 className="text-sm font-bold text-primary">Latest News</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-secondary rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-gold p-4">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-gradient-gold" />
        <h3 className="text-sm font-bold text-primary">Latest News</h3>
      </div>
      <div className="space-y-3 max-h-140 overflow-y-auto">
        {news.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-secondary rounded-lg border border-secondary hover:border-gold-400 transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-xs font-semibold text-primary line-clamp-2 group-hover:text-gradient-gold transition-colors">
                {article.title}
              </h4>
              <ExternalLink className="w-3 h-3 text-muted shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{article.source}</span>
              <span>•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </a>
        ))}
      </div>
      <p className="text-xs text-muted mt-6 mb-2 text-center">
        News powered by GNews API
      </p>
    </div>
  );
}
