-- Migration: 20261103180000_alt146_dsr_insert_initplan.sql
-- ALT-146 — data_subject_requests.p_dsr_insert: auth.jwt() initplan sarması.
--
-- NICIN: #2226 (20261103160000) sonrasi Performance Advisor 9 uyaridan 1'e indi; kalan tek
-- uyari auth_rls_initplan, p_dsr_insert. Sebep: `(select auth.jwt() ->> 'email')` yazimi
-- Postgres'te `( SELECT (auth.jwt() ->> 'email'::text))` olarak saklanir; alt sorgunun
-- icindeki ifade auth.jwt() cagrisinin kendisi degil, ->> operatoru oldugundan advisor
-- cagriyi sarilmamis sayar. Dogru bicim `((select auth.jwt()) ->> 'email')`: cagri tek
-- basina alt sorguda, sorgu basina bir kez hesaplanir. Eski p_dsr_owner_insert de ayni
-- yazimi tasiyordu (3 Kasim ilk advisor olcumunde de isaretliydi).
--
-- NE YAPAR: yalniz p_dsr_insert'in WITH CHECK ifadesi; anlam AYNI (ayni deger, ayni kosullar).
-- Politika adi, komut, rol ve yorum degismez (ALTER POLICY yorumu korur).
--
-- GERI ALMA: ayni ALTER POLICY, applicant_email satiri `(select auth.jwt() ->> 'email')` ile.
-- Cetvel: docs/standards/migration-safety-standard.md, CLAUDE.md kural 13.

begin;
set lock_timeout = '1s';
set statement_timeout = '5s';

alter policy p_dsr_insert on public.data_subject_requests
  with check (
    (select public.is_admin_user())
    or (
      user_id = (select auth.uid())
      and applicant_email = ((select auth.jwt()) ->> 'email')
      and status = 'received'::text
      and due_at = (received_at + '30 days'::interval)
      and outcome is null
      and completed_at is null
      and identity_verified_at is null
      and handled_by is null
      and retained_data_note is null
    )
  );

commit;
