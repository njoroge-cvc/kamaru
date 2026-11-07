import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHandshake, FaMicrophone, FaSeedling } from "react-icons/fa";
import ContactForm from "../ContactForm";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "../motion";
import { PARTNERSHIPS } from "../../content/story";
import { SunSpiral } from "./Ornaments";

const P_ICONS = [FaMicrophone, FaHandshake, FaSeedling];
const MotionLink = motion.create(Link);
const P_COLORS = ["#D7262E", "#2588C9", "#3E9B4F"];

export const PartnerSection = () => (
  <section id="partner" className="relative bg-cream overflow-hidden">
    <div className="container mx-auto px-5 md:px-8 py-24 md:py-32">
      <SectionHeading
        eyebrow="Walk with us"
        title="A fire is kept alive by many hands"
        intro="Our initiatives are offered free of charge — seeds sown for generations to come. Here is how you can help them grow."
      />
      <Stagger className="mt-16 grid md:grid-cols-3 gap-6">
        {PARTNERSHIPS.map((p, i) => {
          const Icon = P_ICONS[i];
          return (
            <StaggerItem key={p.title}>
              <MotionLink
                to="/support"
                whileHover={{ y: -8 }}
                className="group relative block h-full overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-earth/5 hover:shadow-xl transition-shadow"
              >
                <motion.span
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15"
                  style={{ backgroundColor: P_COLORS[i] }}
                  whileHover={{ scale: 1.6 }}
                />
                <span
                  className="relative grid h-14 w-14 place-items-center rounded-2xl text-2xl text-cream"
                  style={{ backgroundColor: P_COLORS[i] }}
                >
                  <Icon />
                </span>
                <h3 className="relative mt-6 font-display text-2xl font-bold text-earth">{p.title}</h3>
                <p className="relative mt-3 text-earth-700">{p.text}</p>
                <p className="relative mt-6 font-semibold text-ochre group-hover:underline underline-offset-4">
                  Ways to support →
                </p>
              </MotionLink>
            </StaggerItem>
          );
        })}
      </Stagger>
      <Reveal className="mt-12 text-center">
        <Link to="/support" className="k-btn-dark px-8 py-4 text-base">
          See all the ways to support
        </Link>
      </Reveal>
    </div>
  </section>
);

export const ContactSection = () => (
  <section id="contact" className="relative bg-ochre text-cream overflow-hidden grain">
    <div className="relative container mx-auto px-5 md:px-8 py-24 md:py-32 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
      <SectionHeading
        light
        align="left"
        eyebrow="Talk to us"
        title="Have a question? Reach out."
        intro="Contestants, parents, partners, journalists — we'd love to hear from you."
        className="[&_p]:!text-cream/90 [&_span.h-px]:!bg-cream"
      />
      <Reveal delay={0.15} className="relative">
        {/* The spinning sun anchors the form, peeking out behind its top-right corner */}
        <SunSpiral
          className="pointer-events-none absolute -right-16 -top-20 z-0 w-64 md:-right-24 md:-top-28 md:w-96"
          color="#D57500"
        />
        <div className="relative z-10 rounded-[2rem] bg-cream p-2 text-earth shadow-2xl">
          <ContactForm />
        </div>
      </Reveal>
    </div>
  </section>
);
