-- Migration: Add locale column to venthub_orders
-- Date: 2026-05-27
-- Description: Tracks the language context in which the order was placed.

ALTER TABLE public.venthub_orders ADD COLUMN locale TEXT DEFAULT 'tr';
