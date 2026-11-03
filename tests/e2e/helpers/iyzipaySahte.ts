/**
 * `npm:iyzipay` test sahtesi (denoRuntime `moduleRewrites` ile bağlanır).
 * Yetki kapısı testleri SDK'nın HİÇ kurulmadığını sayaçla doğrular: kapı geçilmeden para
 * sağlayıcısına dokunulmamalı.
 */
export const iyzipaySayac = { kurulum: 0 }

export default class IyzipaySahte {
  static LOCALE = { TR: 'tr' }
  constructor() {
    iyzipaySayac.kurulum++
  }
}
