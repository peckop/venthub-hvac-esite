import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

/**
 * MÜŞTERİ-YÜZÜ FORM YAZMA KATMANI — `docs/standards/form-submission-standard.md` §6.
 *
 * NİÇİN SERVİS: bileşen doğrudan `supabase.from(...)` çağırmaz; yazma DI'lı bir servisten
 * geçer (CLAUDE.md §2 — ilk parametre `supabase`). Ev deseni: `createQuoteRequest`.
 *
 * NİÇİN RPC, DOĞRUDAN TABLO DEĞİL — cetvel §6'da ölçülmüş kısıt: `insert().select()` =
 * `INSERT ... RETURNING` ve `RETURNING` tablo üzerinde `SELECT` yetkisi ister. Bunu anon'a
 * vermek ziyaretçiye **başkalarının mesajlarını** okutmak olurdu. `SECURITY DEFINER`
 * fonksiyon hem id döndürür (§1'in kanıtı) hem anon'u tablodan tümüyle uzak tutar.
 *
 * NİÇİN `id` DÖNÜYOR ve NİÇİN BOŞSA HATA — cetvel §1: "hatasızlık tek başına zayıf
 * kanıttır; geri dönen kimlik, satırın gerçekten oluştuğunu gösteren tek pozitif işarettir."
 * Bu yüzden `error` yokken bile `data` boşsa BAŞARI SAYMIYORUZ — çağıranın başarı ekranını
 * açabileceği tek durum, elinde bir id olmasıdır.
 */
export interface ContactMessageInput {
  name: string
  message: string
  email?: string
  phone?: string
  company?: string
  city?: string
  applicationArea?: string
  /** Boş bırakılırsa veritabanı `'web-form'` yazar. */
  subject?: string
  /** KVKK rızası. `false` ise fonksiyon satır YAZMAZ, hata döndürür (cetvel §3). */
  consent: boolean
}

/** Yazılan satırın kimliğini döndürür. Hata durumunda FIRLATIR — sessiz yutma yok. */
export async function submitContactMessage(
  supabase: SupabaseClient<Database>,
  input: ContactMessageInput,
): Promise<string> {
  const { data, error } = await supabase.rpc('submit_contact_message', {
    p_name: input.name,
    p_message: input.message,
    p_email: input.email,
    p_phone: input.phone,
    p_company: input.company,
    p_city: input.city,
    p_application_area: input.applicationArea,
    p_subject: input.subject,
    p_consent: input.consent,
  })

  if (error) throw error
  if (!data) {
    // Kanıtsız başarı: fonksiyon hata vermedi ama kimlik de dönmedi. Cetvel §1'e göre
    // bu BAŞARI DEĞİLDİR; çağıran başarı ekranını açmasın diye hataya çeviriyoruz.
    throw new Error('submit_contact_message kimlik döndürmedi — yazma kanıtlanamadı')
  }
  return data
}
