"use client";

import React from 'react'
import { motion } from 'framer-motion'

export const RevealSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {children}
  </motion.div>
)

export default RevealSection
