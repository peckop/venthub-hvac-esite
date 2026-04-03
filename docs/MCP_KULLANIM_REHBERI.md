# 🧠 Model Context Protocol (MCP) Sunucuları Kullanım Rehberi

Bu doküman, projeye entegre edilebilecek veya sistemin potansiyelini artıran MCP (Model Context Protocol) araçlarının ne anlama geldiğini, hangi amaçlarla kullanılacağını ve "Fiziksel Sistem / Gerçek Hayat" analojilerini içermektedir.

> [!NOTE]
> **MCP (Model Context Protocol) Nedir?**
> Bir yapay zeka ajanının, tıpkı fiziksel bir ustanın takım çantasındaki farklı aletleri (matkap, ölçü aleti, lehim makinesi) kullanarak gerçek dünyadaki sistemlere etki etmesi veya veri okuması gibi, dış hizmetleri ve veritabanlarını kontrol etmesini sağlayan "Standartlaştırılmış Soket (Priz) Sistemidir."

---

## 1. ArizeTracingAssistant (Uçuş Veri Kaydedici / Karakutu)

**Nedir?** Yapay zeka (LLM) ajanlarının yanıtlarını, düşünme yollarını ve süreçte verdikleri kararları detaylı bir şekilde kaydeden sistemdir.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Üretim hattında bir hata meydana geldiğinde hatanın hangi istasyonda ve neden olduğunu bulmak için. Eğer yapay zeka absürt bir yanıt verirse veya sisteme yanlış veri kaydederse, bu hatanın (bug) nerede başladığını Arize üzerinden saniye saniye izleyip teşhis ederiz.

## 2. Genkit (Modüler Motor Şasesi ve Akış Kontrolü)

**Nedir?** Karmaşık AI yeteneklerini tıpkı bir fabrikadaki "Üretim Akış Şeması" (Flow) gibi modüler bir düzende çalıştıran ana şasedir.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Sistemde birden fazla yapay zeka modelinin aynı anda çalıştığı durumları düşünün. Biri resmi analiz edip diğeri rapor yazacak olsun. Bu iki süreci ardışık bir montaj bandı gibi (genkit flows) planlamak, test etmek ve durdurup başlatmak (start/stop) için Genkit ortamı kurulur.

## 3. Airweave (Pnömatik Tüp & Merkezi Arşiv Lojistiği)

**Nedir?** 50'den fazla farklı platformu (Uygulama, Veritabanı, PDF vb.) saniyeler içinde birbirine bağlayan ve güncel senkronize arama yapmayı sağlayan merkezi arama istasyonudur.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Elimizde dağınık veri havuzları varsa (Örneğin ürün verileri Supabase'de, müşteri şikayetleri Zendesk'te, kataloglar PDF dosyasında), ajanın tek bir merkezden devasa bir dosya kütüphanesini tarar gibi bu verilere anında ulaşıp cevap üretmesi gerektiğinde ihtiyaç duyulur.

## 4. Prisma (Gelişmiş Valf Bloğu ve Kontrol Panosu)

**Nedir?** Kod ile doğrudan veritabanı arasındaki bağlantıyı kuran, tip korumalı gümrük kapısı / sigorta panosudur (ORM).
**Ne Zaman ve Neden İhtiyaç Duyulur?** Veritabanına (Örneğin PostgreSQL) doğrudan SQL yazmadan, sıkı ve kurallı (type-safe) bir filtre ile okuma/yazma yapmak istediğimizde. Hata riskini minimize ederek (yanlış tipte verinin boruya girmesini engelleyen bir filtre valfi gibi) veriyi yönetmemizi sağlar.

## 5. Pinecone (Anlamsal Depo & İkiz Parça Radarı)

**Nedir?** Verilerin doğrudan kelime karşılıklarını değil, anlamsal uzaydaki "matematiksel ağırlıklarını" saniyeler içinde eşleştiren (Vektör) arama motoru deposudur.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Klasik veritabanları "mavi vana 3 inç" yazısını arar. Pinecone ise "su akışını kesen, paslanmaz boruya uygun parça" diye aradığınızda, mavi vanayı anlayıp (vektör anlamsal bağı) karşınıza getirir. Ürün öneri motorları (Bunu alan şunu da aldı) veya akıllı katalog taramaları için vazgeçilmezdir.

## 6. Heroku (Uzaktan Devreye Alma Şantiyesi)

**Nedir?** Kodların kendi bilgisayarımızdan çıkarak tüm dünyaya açılacağı barındırma (Cloud Hosting) santralinin uzaktan kumandasıdır.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Yapılan geliştirmelerin yayına (Prod) veya test ortamına (Stage) gönderilmesi, sunucunun kapatıp açılması (dyno scale) ve o andaki performans/bellek tıkanıklarının çözümlenmesi gerektiğinde, ajanın komutla platformu "uzaktan bir şantiye şefi gibi" yönetebilmesi için kullanılır.

## 7. Perplexity (Gerçek Zamanlı Radar ve Küresel Kütüphane)

**Nedir?** İnterneti canlı olarak tarayabilen, eski veri yerine en güncel kaynakları derleyip güçlü bir araştırma ofisi gibi çalışan sorgu motorudur.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Çözülecek problemin cevabı anlık ve değişken olduğunda veya bir kodlama kütüphanesinin en yeni kullanımına (dokümana) ihtiyaç duyduğumuzda güncel "radar taraması" yapar. Böylece eskimiş veya tahmini cevaplar (hallucinations) üretilmesi engellenir.

## 8. Redis (Aktarma Merkezi ve Yüksek Hızlı RAM Ambarı)

**Nedir?** Verileri kalıcı yavaş depolama alanları (Harddisk) yerine sistemin anlık hızlı hafızasında (RAM) tutan süper hızlı araç/mesajlaşma ortamıdır. İnteraktif aktarma merkezlerindeki dev forklift ağına veya hava kargoda beklemeden iletilen geçici depoya benzer.
**Ne Zaman ve Neden İhtiyaç Duyulur?** Kalıcı olması gerekmeyen (Örneğin "15 dakika geçerli doğrulama kodu", "sepetteki geçici ürünler", "kimler şu an sayfada" gibi) anlık ve saniyede on binlerce kez okuma-yazma yapılması gereken senaryolarda sistemi kilitlememek için kullanılır. Ayrıca farklı makinelerin birbirleriyle mesajlaşma veya sipariş kuyruğu oluşturmasında kullanılır.

> [!IMPORTANT]  
> Bu araçların tamamı, otonom ajanın (JULES/AI) sadece kod yazan bir bot olmaktan çıkıp, tüm fabrikadaki aletleri, şebekeleri ve makineleri yerinden kalkmadan yönetebilen gerçek bir **"Sistem Analisti"** haline dönüşmesini sağlar.
