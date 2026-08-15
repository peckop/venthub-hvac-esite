import { describe, it, expect } from 'vitest'
import {
  DEFAULT_TENANT_ID,
  TenantMismatchError,
  tenantFromRow,
  tenantFromServiceBody,
  tenantFromVerifiedUser,
} from '../tenant'

/**
 * `_shared/tenant.ts` SÖZLEŞMESİNİN KİLİDİ (T026-VH Adım 1).
 *
 * Bu modül bir kolaylık katmanı değil, tenant sınırının kendisi. Ona bağlanacak her uç
 * (Adım 2–5) buradaki davranışı varsayacak; davranış sessizce kayarsa açığı hiçbir uç
 * fark etmez. Bu yüzden testler "fonksiyon çalışıyor mu"yu değil, **hangi girdinin
 * tenant belirlemeye YETKİLİ olduğunu** kilitler.
 *
 * Modül saftır (ağ yok, `Request` yok, SDK yok) — vitest doğrudan import edebiliyor,
 * Deno çalıştırmaya gerek yok. `supabase/` tsconfig'te hariç olduğu için `tsc` bu dosyayı
 * görmez; kapı budur.
 */

const TENANT_A = '11111111-1111-4111-8111-111111111111'
const TENANT_B = '22222222-2222-4222-8222-222222222222'

describe('tenantFromVerifiedUser — sınıf (a): otorite profil, claim yalnız çapraz kontrol', () => {
  it('claim YOKKEN profili kabul eder (bugünkü canlı durum: 2/2 kullanıcıda claim yok)', () => {
    const d = tenantFromVerifiedUser({ id: 'u1' }, { role: 'admin', tenant_id: TENANT_A })
    expect(d).toEqual({ tenantId: TENANT_A, source: 'user_profile' })
  })

  it('claim profille AYNIYSA profili kabul eder', () => {
    const d = tenantFromVerifiedUser(
      { id: 'u1', app_metadata: { tenant_id: TENANT_A } },
      { tenant_id: TENANT_A },
    )
    expect(d.tenantId).toBe(TENANT_A)
  })

  it('claim profilden FARKLIYSA reddeder — sessizce birini seçmez', () => {
    expect(() =>
      tenantFromVerifiedUser(
        { id: 'u1', app_metadata: { tenant_id: TENANT_B } },
        { tenant_id: TENANT_A },
      ),
    ).toThrow(TenantMismatchError)
  })

  it('profil satırı YOKKEN claim VARSA reddeder — fail-closed', () => {
    // Sessizce DEFAULT'a düşmek, kullanıcıyı doğrulayamadığımız bir tenant'a yazmak olurdu.
    expect(() =>
      tenantFromVerifiedUser({ id: 'u1', app_metadata: { tenant_id: TENANT_B } }, null),
    ).toThrow(TenantMismatchError)
  })

  it('hata mesajı tenant UUID sızdırmaz (alanlarda taşınır, mesajda değil)', () => {
    try {
      tenantFromVerifiedUser({ id: 'u1', app_metadata: { tenant_id: TENANT_B } }, { tenant_id: TENANT_A })
      throw new Error('beklenen hata atılmadı')
    } catch (e) {
      expect(e).toBeInstanceOf(TenantMismatchError)
      const err = e as TenantMismatchError
      expect(err.message).toBe('tenant_mismatch')
      expect(err.message).not.toContain(TENANT_A)
      expect(err.claimTenantId).toBe(TENANT_B)
      expect(err.profileTenantId).toBe(TENANT_A)
    }
  })

  it('ne profil ne claim varsa DEFAULT döner ve bunu source ile İTİRAF EDER', () => {
    // `source: 'default'` denetim sinyalidir: sınıf-(a) ucunda bunu gören çağıran,
    // kapının çalışmadığını anlayıp reddedebilir.
    const d = tenantFromVerifiedUser({ id: 'u1' }, null)
    expect(d).toEqual({ tenantId: DEFAULT_TENANT_ID, source: 'default' })
  })
})

describe('geçersiz değerler tenant belirleyemez', () => {
  it('UUID olmayan profil değeri kabul edilmez — PostgREST filtresine ham girdi gitmez', () => {
    // `tenant_id=eq.<değer>` sorgu dizesine giriyor; virgül/operatör taşıyan bir değer
    // filtreyi genişletebilirdi.
    const d = tenantFromVerifiedUser({ id: 'u1' }, { tenant_id: 'x,role.eq.admin' })
    expect(d.tenantId).toBe(DEFAULT_TENANT_ID)
    expect(d.source).toBe('default')
  })

  it('boş dize, sayı ve nesne kabul edilmez', () => {
    for (const bad of ['', '   ', 42, {}, [], true]) {
      expect(tenantFromServiceBody({ tenant_id: bad }).tenantId).toBe(DEFAULT_TENANT_ID)
    }
  })

  it('UUID küçük harfe normalleştirilir — aynı tenant iki ayrı dize olarak dolaşmaz', () => {
    const d = tenantFromRow({ tenant_id: TENANT_A.toUpperCase() })
    expect(d.tenantId).toBe(TENANT_A)
  })
})

describe('tenantFromServiceBody — sınıf (b): yalnız service_role DOĞRULANDIKTAN sonra', () => {
  it('snake_case ve camelCase yazımını da okur', () => {
    expect(tenantFromServiceBody({ tenant_id: TENANT_A }).source).toBe('service_body')
    expect(tenantFromServiceBody({ tenantId: TENANT_A }).tenantId).toBe(TENANT_A)
  })

  it('gövde tenant taşımıyorsa DEFAULT — fallback ZORUNLU', () => {
    // `stock-alert -> notification-service` çağrısı gövdesinde tenant göndermiyor;
    // fallback kaldırılırsa o bildirim zinciri kırılır (plan R4).
    expect(tenantFromServiceBody({ to: 'a@b.c' })).toEqual({
      tenantId: DEFAULT_TENANT_ID,
      source: 'default',
    })
  })

  it('gövde nesne değilse patlamaz', () => {
    for (const bad of [null, undefined, 'metin', 7]) {
      expect(tenantFromServiceBody(bad).tenantId).toBe(DEFAULT_TENANT_ID)
    }
  })
})

describe('tenantFromRow — sınıf (c): imza doğrulandıktan sonra kaynağın SATIRINDAN', () => {
  it('satırdaki tenant türetilir', () => {
    expect(tenantFromRow({ tenant_id: TENANT_B })).toEqual({
      tenantId: TENANT_B,
      source: 'resource_row',
    })
  })

  it('satır yoksa DEFAULT döner — ama bu "kayıt bulundu" ANLAMINA GELMEZ', () => {
    // Çağıran satırın varlığını AYRICA doğrulamalı; bu fonksiyon 404 kararı vermez.
    expect(tenantFromRow(null).source).toBe('default')
  })
})

describe('yapısal kilit — modül isteğe DOKUNAMAZ', () => {
  it('dışa verilen hiçbir fonksiyon Request/başlık/query kabul etmiyor', () => {
    // Kök sebep "sıra yanlıştı" değil, tenant modülünün istek nesnesine erişebilmesiydi.
    // İmzalar bunu yapısal olarak imkânsız kılar: hiçbiri Request almıyor.
    expect(tenantFromVerifiedUser.length).toBe(2)
    expect(tenantFromServiceBody.length).toBe(1)
    expect(tenantFromRow.length).toBe(1)
  })
})
