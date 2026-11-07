import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaFeatherAlt } from "react-icons/fa";
import PageHero from "../components/PageHero";
import { Stagger, StaggerItem } from "../components/motion";
import { fetchBlogPosts } from "../api";
import { cld } from "../utils/cloudinary";

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }) : "";

const TINTS = ["bg-ochre", "bg-forest", "bg-night", "bg-maroon"];

const PostCard = ({ post, i, featured }) => (
  <Link to={`/blog/${post.slug}`} className="group block h-full">
    <motion.article
      whileHover={{ y: -6 }}
      className={`k-cut-strong flex h-full flex-col overflow-hidden bg-white shadow-md ${featured ? "md:flex-row" : ""}`}
    >
      <div className={`relative shrink-0 overflow-hidden ${featured ? "aspect-[16/10] md:aspect-auto md:w-3/5" : "aspect-[16/10]"} ${TINTS[i % TINTS.length]}`}>
        {post.cover_image_url ? (
          <img
            src={cld(post.cover_image_url, featured ? 1200 : 720)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <FaFeatherAlt className="absolute inset-0 m-auto text-7xl text-cream/25" />
        )}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:p-10 md:justify-center" : ""}`}>
        <p className="k-quad-shape self-start bg-kamaru/20 px-3 py-1 text-xs font-semibold text-ochre-dark">{formatDate(post.published_at)}</p>
        <h2 className={`mt-4 font-display text-earth ${featured ? "text-3xl md:text-4xl" : "text-2xl"}`}>{post.title}</h2>
        {post.excerpt && <p className="mt-3 text-earth-700 line-clamp-3">{post.excerpt}</p>}
        <span className="mt-auto inline-flex items-center gap-2 pt-6 font-semibold text-ochre">
          Read more <FaArrowRight className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </motion.article>
  </Link>
);

const BlogPage = () => {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    fetchBlogPosts()
      .then((r) => setPosts(r.data?.posts || []))
      .catch(() => setPosts([]));
  }, []);

  const [first, ...rest] = posts || [];

  return (
    <div className="min-h-screen bg-cream">
      <PageHero
        crumb="Blog"
        eyebrow="Blog"
        title="Stories of our culture"
        intro="Writing on Kikuyu culture: our songs, sayings, values and the wisdom of those who came before us."
      />

      <section className="container mx-auto px-5 py-16 md:px-8 md:py-20">
        {posts === null ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="k-cut-strong aspect-[4/5] animate-pulse bg-cream-dark" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="k-cut-strong mx-auto max-w-2xl bg-white p-12 text-center shadow-sm">
            <FaFeatherAlt className="mx-auto text-5xl text-kamaru" />
            <h2 className="mt-4 font-display text-3xl text-earth">The first stories are being written</h2>
            <p className="mt-2 text-earth-700">Check back soon for writing on Kikuyu culture.</p>
          </div>
        ) : (
          <>
            <PostCard post={first} i={0} featured />
            {rest.length > 0 && (
              <Stagger className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <StaggerItem key={p.id} className="h-full">
                    <PostCard post={p} i={i + 1} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default BlogPage;
