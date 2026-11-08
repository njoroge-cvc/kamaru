import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import PageHero from "../components/PageHero";
import BlogContent from "../components/BlogContent";
import { Reveal } from "../components/motion";
import { fetchBlogPost } from "../api";
import { cld } from "../utils/cloudinary";
import { formatDate } from "./BlogPage";
import { useSeo, SITE } from "../utils/seo";

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    setPost(undefined);
    fetchBlogPost(slug)
      .then((r) => setPost(r.data?.post || null))
      .catch(() => setPost(null));
  }, [slug]);

  // Per-article title, description, canonical and Article structured data
  const image = post?.cover_image_url ? cld(post.cover_image_url, 1200) : undefined;
  useSeo({
    title: post?.title,
    description: post?.excerpt || (post?.content || "").replace(/[#>*[\]()-]/g, "").slice(0, 155),
    path: `/blog/${slug}`,
    image,
    noindex: post === null,
    jsonLd: post && {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt || undefined,
      image: image || `${SITE}/og-image.jpg`,
      datePublished: post.published_at,
      dateModified: post.updated_at || post.published_at,
      inLanguage: "en",
      mainEntityOfPage: `${SITE}/blog/${slug}`,
      author: post.author_name
        ? { "@type": "Person", name: post.author_name, ...(post.author_title && { jobTitle: post.author_title }), ...(post.author_org && { worksFor: { "@type": "Organization", name: post.author_org } }) }
        : { "@type": "Organization", name: "Kamaru Challenge", url: SITE },
      publisher: { "@id": `${SITE}/#organization` },
    },
  });

  if (post === null) {
    return (
      <div className="min-h-screen bg-cream">
        <PageHero crumb="Blog" eyebrow="Blog" title="Story not found" intro="It may have been moved or unpublished." />
        <div className="container mx-auto px-5 py-16 text-center md:px-8">
          <Link to="/blog" className="k-btn-primary px-7 py-3.5">
            <FaArrowLeft /> All stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <PageHero
        crumb="Blog"
        eyebrow={post ? [formatDate(post.published_at), post.author].filter(Boolean).join(" · ") : "Blog"}
        title={post?.title || "Loading…"}
        intro={post?.excerpt}
      />

      <article className="container mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        {post === undefined ? (
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-5 animate-pulse k-quad-shape bg-cream-dark" />
            ))}
          </div>
        ) : (
          <>
            {post.cover_image_url && (
              <Reveal className="-mt-28 mb-12 md:-mt-36">
                <img src={cld(post.cover_image_url, 1400)} alt="" className="k-cut-strong relative z-10 w-full shadow-2xl" />
              </Reveal>
            )}
            {post.author && (
              <div className="k-cut mb-10 flex items-center gap-4 bg-white p-5 shadow-sm">
                <span className="grid h-12 w-12 shrink-0 place-items-center k-quad-shape bg-kamaru font-display text-xl text-earth">
                  {post.author.trim().charAt(0).toUpperCase()}
                </span>
                <span className="leading-snug">
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-ochre">Written by</span>
                  <span className="block font-display text-lg text-earth">{post.author}</span>
                  {(post.author_title || post.author_org) && (
                    <span className="block text-sm text-earth-600">{[post.author_title, post.author_org].filter(Boolean).join(", ")}</span>
                  )}
                </span>
              </div>
            )}
            <BlogContent text={post.content} />
            <div className="mt-14 border-t border-earth/10 pt-8">
              <Link to="/blog" className="k-btn-outline px-6 py-3">
                <FaArrowLeft /> All stories
              </Link>
            </div>
          </>
        )}
      </article>
    </div>
  );
};

export default BlogPostPage;
