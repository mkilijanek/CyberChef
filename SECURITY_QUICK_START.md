# 🚀 Security Automation - Quick Start Guide

> **Uwaga (2026-10):** workflow `security-auto-fix.yml` został usunięty (#105). Aktualizacje zależności npm obsługuje wyłącznie Dependabot (`.github/dependabot.yml`), a dzienny `npm audit fix` kolidował z jego PR-ami. Lokalnie nadal działają `npm run security:triage` i `npm run security:fix`. Opisy workflow poniżej są historyczne.

**5-minutowy przewodnik uruchomienia automatyzacji bezpieczeństwa**

---

## ⚡ Szybki Start

### Krok 1: Sprawdź Co Masz (30 sekund)

```bash
cd /path/to/CyberChef

# Sprawdź czy pliki istnieją
ls -la .github/workflows/security*.yml
ls -la .github/dependabot.yml
ls -la scripts/vulnerability-triage.js
ls -la scripts/security-fix.sh

# Wszystko powinno być ✅
```

### Krok 2: Test Lokalny (2 minuty)

```bash
# Uruchom triage script lokalnie
npm run security:triage

# Zobaczysz raport podatności:
# 📊 Summary:
#    🔴 Critical: X
#    🟠 High: Y
#    🟡 Moderate: Z
```

### Krok 3: Push do GitHub (1 minuta)

```bash
# Commit i push (już gotowe w tym PR)
git add .
git commit -m "feat: Add security automation workflows"
git push
```

### Krok 4: Weryfikacja na GitHub (2 minuty)

```bash
# 1. Sprawdź workflows
https://github.com/{owner}/{repo}/actions

# Powinny być widoczne:
# ✅ Dependency Review
# ✅ CodeQL Analysis

# 2. Sprawdź Dependabot
https://github.com/{owner}/{repo}/security/dependabot

# Powinien być aktywny z dziennikiem zależności
```

---

## 🎯 Kluczowe Komendy

### Dla Developerów

```bash
# Przed commitowaniem
npm run security:check        # Quick security scan

# Sprawdź podatności
npm run security:audit        # Podstawowy audit
npm run security:triage       # Zaawansowana analiza

# Napraw podatności
npm run security:fix          # Automatyczna naprawa
npm audit fix                 # Alternatywa npm
```

### Dla Security Team

```bash
# Eksport raportu
npm run security:triage:json  # → vulnerability-report.json

# Force fix critical
npm audit fix --force

# Lokalne naprawy (backup package-lock.json, potem npm test ręcznie)
npm run security:fix
```

---

## 📋 Checklist Pierwszego Dnia

### Rano (15 min)

```
☐ 1. Sprawdź Actions tab
     → https://github.com/{owner}/{repo}/actions
     → Czy workflows są enabled?

☐ 2. Sprawdź Security tab
     → https://github.com/{owner}/{repo}/security
     → Czy Dependabot jest active?
     → Ile podatności?

☐ 3. Review pierwszy raport
     → npm run security:triage
     → Zanotuj liczby
```

### Po Południu (30 min)

```
☐ 4. Sprawdź otwarte PR-y Dependabota
     → Pull requests → author:app/dependabot

☐ 5. Review PR-ów Dependabota
     → Przejrzyj zmiany
     → Sprawdź testy
     → Merge jeśli OK

☐ 6. Skonfiguruj notyfikacje
     → Settings → Notifications
     → ✅ Actions (failed workflows)
     → ✅ Dependabot
     → ✅ Security alerts
```

### Wieczorem (15 min)

```
☐ 7. Dodaj branch protection
     → Settings → Branches → Add rule
     → ✅ Require status checks (dependency-review)

☐ 8. Przypisz security team
     → .github/dependabot.yml
     → Dodaj reviewers/assignees

☐ 9. Share dokumentację
     → Wyślij link do SECURITY_AUTOMATION.md
     → Brief zespół na standup
```

---

## 🔥 Najczęstsze Pierwsze Problemy

### Problem: "Workflow nie uruchomił się"

```bash
# Rozwiązanie:
# 1. Sprawdź permissions
Repository → Settings → Actions → General
☑ Read and write permissions

# 2. Sprawdź, czy Actions nie są wyłączone dla repozytorium
gh workflow list
```

### Problem: "Za dużo Dependabot PRs"

```bash
# Rozwiązanie:
# 1. Zmień frequency w .github/dependabot.yml
schedule:
  interval: "weekly"  # było: daily

# 2. Lub ogranicz open PRs
open-pull-requests-limit: 3  # było: 10
```

### Problem: "Tests fail po audit fix"

```bash
# Rozwiązanie:
# npm run security:fix zostawia package-lock.json.backup:
mv package-lock.json.backup package-lock.json && npm ci
# Zobacz który package powoduje problem
# Fix manually lub ignore w dependabot.yml
```

---

## 📊 Metryki Sukcesu

### Po Tygodniu

```
Sprawdź:
✅ Ile podatności naprawionych automatycznie?
✅ Ile PRs utworzonych przez Dependabot?
✅ Czy CodeQL znalazł coś w kodzie?
✅ Czy zespół rozumie workflow?

Target:
→ -50% podatności critical/high
→ 0 failed workflows
→ Zespół trained
```

### Po Miesiącu

```
Sprawdź:
✅ Time to fix critical: < 24h
✅ Time to fix high: < 7 dni
✅ Open critical/high: 0
✅ Auto-fix success rate: > 70%

Optimize:
→ Tune dependabot frequency
→ Add custom rules
→ Update KEV list
```

---

## 🎓 Szkolenie Zespołu (10 min presentation)

### Slajd 1: Co Się Zmieniło
- ✅ Automatyczne skanowanie codziennie
- ✅ PRs blokowane jeśli unsafe
- ✅ Auto-fix dla większości podatności

### Slajd 2: Co Musisz Robić
- 📧 Review security PRs (wysokie priority!)
- ✅ Run `npm run security:check` przed push
- 🚫 NIE ignoruj czerwonych checks w PR

### Slajd 3: Gdzie Szukać Pomocy
- 📖 SECURITY_AUTOMATION.md - pełna docs
- 🚀 SECURITY_QUICK_START.md - quick ref
- 💬 GitHub Discussions - pytania
- 🔥 @security-team - emergencies

---

## 🚨 Emergency Response Card

**Wydrukuj i przyklej przy monitorze:**

```
═══════════════════════════════════════════
   🚨 CRITICAL VULNERABILITY DETECTED 🚨
═══════════════════════════════════════════

1. ⏱️  IMMEDIATE (< 1h):
   □ Check GitHub Security tab
   □ Review GHSA advisory
   □ Assess impact on our code

2. 🔧 FIX (< 4h):
   □ Run: npm run security:fix
   □ If fails: Check for alternative package
   □ If no alternative: Vendor patch

3. ✅ VERIFY (< 1h):
   □ Run tests: npm test
   □ Run triage: npm run security:triage
   □ Confirm 0 critical

4. 🚀 DEPLOY (< 2h):
   □ Create emergency PR
   □ Fast-track review
   □ Deploy to production

5. 📝 DOCUMENT:
   □ Add to SECURITY.md
   □ Update KEV list
   □ Post-mortem (next day)

═══════════════════════════════════════════
Emergency contact: @security-team
═══════════════════════════════════════════
```

---

## 📚 Linki Skrótów

| Co Chcesz | Gdzie Iść |
|-----------|-----------|
| **Pełna dokumentacja** | [SECURITY_AUTOMATION.md](SECURITY_AUTOMATION.md) |
| **Zobacz podatności** | `npm run security:triage` |
| **Napraw podatności** | `npm run security:fix` |
| **GitHub workflows** | `.github/workflows/` |
| **Config Dependabot** | `.github/dependabot.yml` |
| **Triage script** | `scripts/vulnerability-triage.js` |

---

## ✅ Gotowe do Startu!

Jesteś gotowy kiedy:

```
✅ Workflows są w .github/workflows/
✅ Dependabot config jest w .github/dependabot.yml
✅ Scripts są executable (chmod +x)
✅ npm run security:triage działa
✅ Zespół wie co się dzieje
✅ Notyfikacje są skonfigurowane
```

### Następny Krok

```bash
# Jeśli wszystko OK:
git push origin main

# I obserwuj:
# 1. GitHub Actions - pierwsze runnery
# 2. Dependabot - pierwsze PR
# 3. Security tab - live monitoring

# Gratulacje! 🎉
# Automatyzacja bezpieczeństwa działa!
```

---

**Pytania?** → Zobacz [SECURITY_AUTOMATION.md](SECURITY_AUTOMATION.md)

**Problemy?** → Sekcja "Rozwiązywanie Problemów"

**Emergency?** → @security-team + run `npm run security:triage`

---

*Last updated: 2025-12-18*
*Version: 1.0*
