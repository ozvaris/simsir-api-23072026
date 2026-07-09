# {{BAŞLIK}} — Mevcut Durum Tree + Checklist

Son güncelleme: `{{YYYY-MM-DD}}`
Kapsam: `{{PROJE / SİSTEM / MODÜL / SUNUCU / İŞ AKIŞI}}`

---

## Durum Sembolleri

```text
✅ Tamamlandı / aktif / hazır
⏳ Yapılacak / bekliyor
🟡 Kısmen tamamlandı
⚠️ Dikkat gerekiyor
❌ Eksik / kapalı / başarısız
🔒 Güvenlik / erişim / izin konusu
📌 Not / karar / önemli bilgi
```

---

# ÇIKTI 1 — Mevcut Durum Tree

```text
{{ANA_SİSTEM / PROJE / MİMARİ / İŞ_AKIŞI}}
        │
        ├── {{KATMAN / BÖLÜM 1}}
        │     ├── {{madde 1}} {{✅/⏳/🟡/⚠️/❌}}
        │     ├── {{madde 2}} {{✅/⏳/🟡/⚠️/❌}}
        │     ├── {{madde 3}} {{✅/⏳/🟡/⚠️/❌}}
        │     └── {{madde 4}} {{✅/⏳/🟡/⚠️/❌}}
        │
        ├── {{KATMAN / BÖLÜM 2}}
        │     ├── {{madde 1}} {{✅/⏳/🟡/⚠️/❌}}
        │     ├── {{madde 2}} {{✅/⏳/🟡/⚠️/❌}}
        │     └── {{madde 3}} {{✅/⏳/🟡/⚠️/❌}}
        │
        ├── {{KATMAN / BÖLÜM 3}}
        │     ├── {{madde 1}} {{✅/⏳/🟡/⚠️/❌}}
        │     ├── {{madde 2}} {{✅/⏳/🟡/⚠️/❌}}
        │     ├── {{ALT GRUP}}
        │     │     ├── {{alt madde 1}} {{✅/⏳/🟡/⚠️/❌}}
        │     │     └── {{alt madde 2}} {{✅/⏳/🟡/⚠️/❌}}
        │     └── {{madde 3}} {{✅/⏳/🟡/⚠️/❌}}
        │
        └── {{KATMAN / BÖLÜM 4}}
              ├── {{madde 1}} {{✅/⏳/🟡/⚠️/❌}}
              ├── {{madde 2}} {{✅/⏳/🟡/⚠️/❌}}
              └── {{madde 3}} {{✅/⏳/🟡/⚠️/❌}}
```

---

# ÇIKTI 2 — Checklist / Task List

```text
[✅] {{Tamamlanan madde 1}}
[✅] {{Tamamlanan madde 2}}
[✅] {{Tamamlanan madde 3}}
[✅] {{Tamamlanan madde 4}}
[✅] {{Tamamlanan madde 5}}

[🟡] {{Kısmen tamamlanan madde 1}}
[🟡] {{Kısmen tamamlanan madde 2}}

[⚠️] {{Dikkat gereken madde 1}}
[⚠️] {{Dikkat gereken madde 2}}

[⏳] {{Yapılacak madde 1}}
[⏳] {{Yapılacak madde 2}}
[⏳] {{Yapılacak madde 3}}
[⏳] {{Yapılacak madde 4}}
[⏳] {{Yapılacak madde 5}}

[❌] {{Eksik / başarısız madde 1}}
[❌] {{Eksik / başarısız madde 2}}
```

---

## Kısa Özet

```text
Mevcut durum:
{{Sistem / proje / iş akışı şu anda hangi aşamada?}}

Tamamlanan ana başlıklar:
- {{tamamlanan başlık 1}}
- {{tamamlanan başlık 2}}
- {{tamamlanan başlık 3}}

Bekleyen ana başlıklar:
- {{bekleyen başlık 1}}
- {{bekleyen başlık 2}}
- {{bekleyen başlık 3}}

Sıradaki ana hedef:
{{sıradaki hedef}}
```

---

## Kullanım Mantığı

```text
Tree:
Sistemin mevcut yapısını ve katmanlarını gösterir.

Checklist:
Durumu hızlı taranabilir şekilde listeler.

Tree = harita
Checklist = durum / aksiyon listesi
```
