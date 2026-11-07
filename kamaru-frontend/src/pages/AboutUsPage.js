import React, { useEffect, useRef, useState } from "react";
import { cld } from "../utils/cloudinary";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import PageHero from "../components/PageHero";
import { Reveal, Stagger, StaggerItem } from "../components/motion";
import { fetchGalleryImages, fetchSystemImage } from "../api";
import { VALUES, SPACES, ACTIVITIES, QUOTE } from "../content/story";
import ReadMore from "../components/ReadMore";
import { useSeo } from "../utils/seo";

const Chapter = ({ eyebrow, title, lead, children, image, reverse = false }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="grid items-center gap-10 md:grid-cols-2 lg:gap-20">
      <div className={`text-center md:text-left ${reverse ? "md:order-2" : ""}`}>
        <Reveal>
          <p className="k-eyebrow text-ochre">{eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-earth">{title}</h2>
          <p className="mt-4 text-lg font-semibold text-earth-700">{lead}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <ReadMore className="mt-4" collapsedHeight={190}>
            <div className="space-y-4 text-lg leading-relaxed text-earth-700">{children}</div>
          </ReadMore>
        </Reveal>
      </div>
      <Reveal className={reverse ? "md:order-1" : ""}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-earth-700 shadow-2xl">
          {image ? (
            <motion.img
              src={cld(image, 1200)}
              alt=""
              loading="lazy"
              style={{ y, scale: 1.2 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-earth-600 to-earth-800" />
          )}
        </div>
      </Reveal>
    </section>
  );
};

const AboutUs = () => {
  useSeo({ title: "About Us: Fanning the Flame of Values", description: "The story behind the Kamaru Challenge: reconnecting Ndeiya with its Kikuyu identity through music, at Irīma-inī kwa Wanjiku and the Rediscovery Garden, guided by seven timeless values (mītugo).", path: "/about_us" });
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchSystemImage("about").then((r) => r.data?.image?.image_url).catch(() => null),
      fetchGalleryImages().then((r) => (r.data?.images || []).map((i) => i.image_url)).catch(() => []),
    ]).then(([about, gallery]) => {
      const shuffled = [...gallery].sort(() => Math.random() - 0.5);
      setPhotos([about || shuffled[0], ...shuffled].filter(Boolean));
    });
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <PageHero
        crumb="Our story"
        eyebrow="About us"
        title="Fanning the flame of values"
        intro={`“${QUOTE.text}”, ${QUOTE.author}`}
      />

      <div className="container mx-auto space-y-24 px-5 py-20 md:space-y-32 md:px-8">
        <Chapter
          eyebrow="Our history"
          title="Where the flame dimmed"
          lead="Understanding our past helps us shape a better future."
          image={photos[1]}
        >
          <p>
            We believe that Africans have grown indifferent towards the unique values that established them as a
            dignified and happy community. That indifference was hastened by the negative effects of false colonial
            ideologies that made many perceive their culture as uncivilised and one to be ashamed of. To be
            “civilised,” one was expected to cut themselves off from their cultural past.
          </p>
        </Chapter>

        <Chapter
          reverse
          eyebrow="Our values"
          title="Seven timeless values"
          lead="Timeless values are the foundation of a thriving community."
          image={photos[2]}
        >
          <p>
            Postcolonial self-legitimation ideologies promoted material wealth and adoption of the colonisers’
            education and culture as the hallmarks of a good leader, rather than the culturally inculcated values
            our communities had always lived by. Indifference to these values shows in broken families,
            alcoholism, and disengagement from family and community by the youth, especially men.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {VALUES.map((v) => (
              <span
                key={v.name}
                className="k-quad-shape px-4 py-1.5 text-sm font-semibold text-cream"
                style={{ backgroundColor: v.color }}
              >
                {v.name}
              </span>
            ))}
          </div>
        </Chapter>

        <Chapter
          eyebrow="Our mission"
          title="Reconnecting, so we may thrive again"
          lead="Reconnecting with our identity to thrive together as a community."
          image={photos[0]}
        >
          <p>
            We have purposed to do our part to help the community rediscover and reconnect with their identity by
            fanning the flames of the cultural values. We have dedicated two spaces in Nguirubi, Ndeiya to this
            purpose, open for community healing through authentic knowledge and experiences that encourage living
            out those values in every facet of our lives.
          </p>
        </Chapter>

        <section>
          <Stagger className="grid gap-6 md:grid-cols-2">
            {SPACES.map((s, i) => (
              <StaggerItem
                key={s.name}
                className={`rounded-[2rem] p-8 md:p-10 text-cream ${i === 0 ? "bg-ochre" : "bg-forest"}`}
              >
                <h3 className="font-display text-3xl font-bold">{s.name}</h3>
                <p className="mt-3 text-lg text-cream/85">{s.blurb}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-12 rounded-[2rem] bg-white p-8 md:p-10 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-earth">Held in these spaces every year</h3>
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {ACTIVITIES.map((a) => (
                <li key={a.name} className="flex items-center gap-3 text-earth-700">
                  <span className="k-quad-shape shrink-0 bg-kamaru px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-earth">{a.month}</span>
                  {a.name}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-earth-600">
              These initiatives are offered at no fee, our way of sowing seeds that will benefit generations to come.
            </p>
          </Reveal>
        </section>

        <Reveal className="text-center">
          <Link
            to="/register/participant"
            className="group inline-flex items-center gap-2 rounded-full bg-kamaru px-8 py-4 font-semibold text-earth shadow-lg transition hover:bg-kamaru-light"
          >
            Take the Kamaru stage
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default AboutUs;
