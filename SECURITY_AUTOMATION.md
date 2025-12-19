# 🔒 Automatyzacja Zarządzania Podatnościami - Dokumentacja

**Wersja:** 1.0
**Data:** 2025-12-18
**Status:** Gotowe do wdrożenia

---

## 📋 Spis Treści

1. [Przegląd Systemu](#przegląd-systemu)
2. [Komponenty](#komponenty)
3. [Workflow GitHub Actions](#workflow-github-actions)
4. [Konfiguracja Dependabot](#konfiguracja-dependabot)
5. [Skrypty Pomocnicze](#skrypty-pomocnicze)
6. [Instalacja i Konfiguracja](#instalacja-i-konfiguracja)
7. [Użycie](#użycie)
8. [Monitoring i Alerty](#monitoring-i-alerty)
9. [Rozwiązywanie Problemów](#rozwiązywanie-problemów)

---

## 🎯 Przegląd Systemu

System automatycznego zarządzania podatnościami dla CyberChef, zaprojektowany do:

### Cele Główne
- ✅ **Automatyczne wykrywanie** podatności w zależnościach
- ✅ **Priorytetyzacja** według krytyczności i aktywnej eksploatacji
- ✅ **Automatyczne naprawy** podatności krytycznych i wysokich
- ✅ **Blokowanie** PR z podatnościami wysokiego ryzyka
- ✅ **Monitoring** ciągły 24/7
- ✅ **Alerting** dla zespołu bezpieczeństwa

### Priorytety
1. 🚨 **KRYTYCZNE:** Aktywnie eksploatowane podatności
2. 🔴 **WYSOKIE:** Podatności krytyczne z CVSS ≥ 9.0
3. 🟠 **ŚREDNIE:** Podatności wysokie (CVSS 7.0-8.9)
4. 🟡 **NISKIE:** Podatności średnie i niskie

---

## 🧩 Komponenty

### 1. GitHub Actions Workflows

#### `security-auto-fix.yml` - Główny Workflow Automatyczny
**Harmonogram:** Codziennie o 2:00 UTC
**Funkcje:**
- Skanowanie npm audit
- Automatyczne naprawy (npm audit fix)
- Testy po naprawach
- Tworzenie PR z poprawkami
- Tworzenie Issues dla nienaprawialnych podatności

**Triggery:**
- Schedule (codziennie)
- Manual dispatch
- Push do main (dla package.json)

#### `dependency-review.yml` - Przegląd Zależności w PR
**Triggery:** Pull Requests
**Funkcje:**
- Blokuje PR z podatnościami critical/high
- Sprawdza licencje
- Komentuje wyniki w PR
- Wymusza poprawki przed merge

#### `codeql-analysis.yml` - Skanowanie Kodu
**Harmonogram:** Co poniedziałek o 4:00 UTC
**Funkcje:**
- Analiza statyczna kodu (SAST)
- Wykrywanie luk bezpieczeństwa w kodzie
- Security-extended query suite
- Upload wyników do Security tab

### 2. Dependabot

**Konfiguracja:** `.github/dependabot.yml`

**Harmonogram:**
- NPM: Codziennie o 3:00 UTC
- GitHub Actions: Co poniedziałek o 3:00 UTC

**Funkcje:**
- Automatyczne PR z aktualizacjami bezpieczeństwa
- Grupowanie patch updates
- Osobne grupy dla security updates
- Labels i assignees

### 3. Skrypty Pomocnicze

#### `vulnerability-triage.js`
**Zaawansowana analiza i priorytetyzacja podatności**

**Funkcje:**
- Risk scoring (0-100)
- Wykrywanie aktywnie eksploatowanych CVE
- Wykrywanie high-risk CWEs (injection, XSS, etc.)
- Rekomendacje naprawcze
- Export do JSON

---

## 📘 Workflow GitHub Actions - Szczegóły

### Security Auto-Fix Workflow

#### Kroki Wykonania

```yaml
1. Checkout repository
2. Setup Node.js + cache
3. Install dependencies
4. Run npm audit
   ├─ Count vulnerabilities by severity
   ├─ Check for actively exploited CVEs
   └─ Generate audit-results.json

5. Backup package files
6. Apply fixes (Critical & High)
   ├─ npm audit fix --audit-level=high
   └─ Check if changes were made

7. Apply force fixes (if Critical exists)
   ├─ npm audit fix --force
   └─ Only for CRITICAL vulnerabilities

8. Run tests
   ├─ npm test
   ├─ If PASS: continue
   └─ If FAIL: restore backup & exit

9. Generate report
   └─ Create SECURITY_FIX_REPORT.md

10. Create Pull Request
    ├─ Branch: security/auto-fix-{run_number}
    ├─ Title: With vulnerability counts
    ├─ Body: Detailed report
    └─ Labels: security, dependencies, priority-*

11. Create Issue (if unfixable critical)
    └─ Alert security team

12. Upload artifacts
    └─ Store audit results for 90 days
```

#### Parametry Wejściowe (Manual Dispatch)

```bash
# Minimum severity to fix
severity_threshold: low | moderate | high | critical
default: high

# Create PR vs direct commit
create_pr: true | false
default: true
```

#### Przykładowe Użycie

```bash
# Manual trigger via GitHub UI
Actions → Security Auto-Fix → Run workflow

# Manual trigger via CLI
gh workflow run security-auto-fix.yml \
  -f severity_threshold=critical \
  -f create_pr=true
```

---

## 🤖 Konfiguracja Dependabot

### Strategia Grupowania

```yaml
# Wszystkie patch updates razem
patch-updates:
  - "*" (patch)

# Security updates osobno według severity
critical-security:
  - "*" (security-update)

# Dev dependencies osobno
dev-dependencies:
  - development dependencies (minor + patch)
```

### Customizacja

**Ignorowanie pakietów:**
```yaml
ignore:
  - dependency-name: "package-name"
    update-types: ["version-update:semver-major"]
```

**Dodanie reviewers:**
```yaml
reviewers:
  - "security-team"
  - "lead-developer"
```

**Zmiana harmonogramu:**
```yaml
schedule:
  interval: "weekly"  # daily, weekly, monthly
  day: "monday"
  time: "03:00"
```

---

## 🛠️ Skrypty Pomocnicze

### Vulnerability Triage Script

#### Instalacja
```bash
cd /path/to/CyberChef
chmod +x scripts/vulnerability-triage.js
```

#### Użycie

**Podstawowe:**
```bash
# Run analysis
node scripts/vulnerability-triage.js

# Or via npm if added to scripts
npm run security:triage
```

**Z exportem JSON:**
```bash
node scripts/vulnerability-triage.js --json
# Tworzy: vulnerability-report.json
```

#### Exit Codes

| Code | Znaczenie |
|------|-----------|
| 0 | ✅ Brak critical/high |
| 1 | 🟠 High vulnerabilities |
| 2 | 🔴 Critical vulnerabilities |
| 3 | 🚨 Actively exploited |

#### Output Example

```
═══════════════════════════════════════════════════════════
           VULNERABILITY TRIAGE REPORT
═══════════════════════════════════════════════════════════

📊 Summary:
   🔴 Critical: 2
   🟠 High:     5
   🟡 Moderate: 11
   ⚪ Low:      8
   ━━━━━━━━━━━━━━━━━━━━
   📦 Total:    26

🚨 ACTIVELY EXPLOITED VULNERABILITIES: 1

📦 axios (Risk: 85)
   Version: 1.0.0 - 1.11.0
   ❌ No automatic fix
   🚨 ACTIVELY EXPLOITED

   Issues:
   - Axios is vulnerable to DoS attack
     https://github.com/advisories/GHSA-4hjh-wcwx-xvwj
     CVSS: 7.5

   Recommendations:
   🚨 [URGENT] This vulnerability is being actively exploited...
   ⚠️ [HIGH] No automatic fix available. Consider: ...
```

### Security Fix Script

**Lokalizacja:** `scripts/security-fix.sh`

#### Funkcje
- Backup package-lock.json
- Update critical dependencies
- npm audit fix
- Final report
- Rollback instructions

#### Użycie
```bash
./scripts/security-fix.sh
```

---

## ⚙️ Instalacja i Konfiguracja

### Krok 1: Uprawnienia GitHub

Workflow wymaga następujących uprawnień:

```yaml
permissions:
  contents: write        # Commit & push
  pull-requests: write   # Create PRs
  issues: write          # Create issues
  security-events: write # CodeQL results
```

### Krok 2: Secrets (Opcjonalne)

Jeśli używasz prywatnego repozytorium lub chcesz niestandardowe tokens:

```bash
# GitHub Settings → Secrets → Actions
SECURITY_TOKEN=ghp_xxxxxxxxxxxx
```

### Krok 3: Włączenie Workflows

```bash
# Workflows są automatycznie aktywne po commit do .github/workflows/

# Sprawdź status
gh workflow list

# Włącz ręcznie (jeśli wyłączone)
gh workflow enable security-auto-fix.yml
gh workflow enable dependency-review.yml
gh workflow enable codeql-analysis.yml
```

### Krok 4: Konfiguracja Dependabot

```bash
# Dependabot aktywuje się automatycznie po wykryciu .github/dependabot.yml

# Sprawdź status
gh api repos/{owner}/{repo}/vulnerability-alerts

# Włącz Dependabot alerts (jeśli wyłączone)
gh api -X PUT repos/{owner}/{repo}/vulnerability-alerts
```

### Krok 5: Branch Protection Rules

**Zalecane ustawienia dla main/master:**

```
Settings → Branches → Add rule

Branch name pattern: main

☑ Require pull request reviews
☑ Require status checks to pass
  ☑ dependency-review
  ☑ CodeQL
☑ Require conversation resolution
☐ Allow force pushes (NIGDY!)
```

---

## 🚀 Użycie

### Scenariusz 1: Codzienny Automatyczny Skan

**Workflow:** Automatyczny, codziennie o 2:00 UTC

1. Workflow uruchamia się automatycznie
2. Skanuje npm audit
3. Jeśli znajdzie podatności critical/high:
   - Próbuje naprawić automatycznie
   - Uruchamia testy
   - Tworzy PR z poprawkami
4. Jeśli nie może naprawić:
   - Tworzy Issue z alertem
   - Przypisuje security team

**Akcje użytkownika:**
- 📧 Otrzymujesz powiadomienie o PR/Issue
- 👀 Przegląd PR
- ✅ Merge lub request changes
- 🔍 Review Issues dla nienaprawialnych

### Scenariusz 2: Pull Request z Nowymi Zależnościami

**Workflow:** Automatyczny przy każdym PR

1. Developer tworzy PR z nową zależnością
2. Dependency Review workflow:
   - Skanuje nowe zależności
   - Sprawdza licencje
   - Sprawdza podatności
3. Jeśli critical/high:
   - ❌ **BLOKUJE** PR
   - 💬 Dodaje komentarz z details
   - 🔴 Status check FAIL
4. Developer musi naprawić przed merge

**Akcje developera:**
```bash
# 1. Check audit locally
npm audit

# 2. Try automatic fix
npm audit fix

# 3. If no fix available:
#    - Find alternative package
#    - Update to safe version
#    - Document risk acceptance (jeśli konieczne)

# 4. Re-push changes
git push
```

### Scenariusz 3: Manual Security Audit

**Użycie triage script:**

```bash
# Run comprehensive analysis
node scripts/vulnerability-triage.js

# Export to JSON for records
node scripts/vulnerability-triage.js --json

# CI integration
npm run security:triage || echo "Vulnerabilities found!"
```

### Scenariusz 4: Emergency - Aktywnie Eksploatowana Podatność

**Gdy CISA ogłasza nową KEV:**

1. 🚨 **IMMEDIATE:** Dodaj GHSA ID do `ACTIVELY_EXPLOITED` w `vulnerability-triage.js`
2. ⚡ **Uruchom manual workflow:**
   ```bash
   gh workflow run security-auto-fix.yml
   ```
3. 📞 **Notify team** o urgency
4. ✅ **Review i merge** PR natychmiast
5. 🚀 **Deploy** ASAP

---

## 📊 Monitoring i Alerty

### GitHub Security Tab

**Lokalizacja:** Repository → Security

- **Dependabot alerts:** Wszystkie znane podatności
- **Code scanning (CodeQL):** Luki w kodzie źródłowym
- **Secret scanning:** Przypadkowo commitowane secrets

### Email Notifications

**Automatyczne powiadomienia dla:**
- ✉️ Nowe Dependabot PRs
- ✉️ Failed workflow runs
- ✉️ Nowe Issues (critical vulnerabilities)
- ✉️ Security alerts

**Konfiguracja:**
```
Settings → Notifications → Actions
☑ Send notifications for failed workflows
```

### Slack Integration (Opcjonalne)

**Dodaj webhook do workflow:**

```yaml
- name: Notify Slack
  if: steps.audit.outputs.critical > 0
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "🚨 Critical vulnerabilities found!",
        "blocks": [...]
      }
```

### Metryki do Śledzenia

| Metryka | Target | Jak Mierzyć |
|---------|--------|-------------|
| Time to fix (Critical) | < 24h | GitHub Issues |
| Time to fix (High) | < 7 dni | GitHub Issues |
| Open vulnerabilities | 0 critical/high | Dependabot |
| PR block rate | Measure | Dependency Review |
| Auto-fix success rate | > 80% | Workflow artifacts |

---

## 🐛 Rozwiązywanie Problemów

### Problem 1: Workflow Nie Uruchamia Się

**Symptomy:**
- Brak runs w Actions tab
- Schedule nie działa

**Rozwiązanie:**
```bash
# 1. Sprawdź czy workflow jest enabled
gh workflow list

# 2. Włącz jeśli disabled
gh workflow enable security-auto-fix.yml

# 3. Sprawdź permissions
# Repository → Settings → Actions → General
# ☑ Allow all actions
# ☑ Read and write permissions

# 4. Manual trigger test
gh workflow run security-auto-fix.yml
```

### Problem 2: Tests Fail After Fixes

**Symptomy:**
- npm audit fix zastosowany
- Testy nie przechodzą
- Changes zostały rollback

**Rozwiązanie:**
```bash
# 1. Local test
npm audit fix
npm test

# 2. Identify breaking change
git diff package.json

# 3. Fix compatibility issues
npm install package@compatible-version

# 4. Or skip problematic package
# Add to dependabot.yml ignore list
```

### Problem 3: Dependabot PR Conflicts

**Symptomy:**
- Multiple Dependabot PRs
- Merge conflicts

**Rozwiązanie:**
```bash
# Option 1: Merge in order (oldest first)
# Option 2: Close all and run:
@dependabot rebase

# Option 3: Batch update locally
npm update
git commit -m "chore: batch dependency updates"
```

### Problem 4: False Positives

**Symptomy:**
- Vulnerability reported but not applicable
- Dev-only dependency

**Rozwiązanie:**

**Krótkoterminowo:**
```yaml
# Add to .github/dependabot.yml
ignore:
  - dependency-name: "false-positive-package"
    reason: "Not used in production"
```

**Długoterminowo:**
- Dokumentuj decision w SECURITY.md
- Review regularnie (quarterly)
- Update gdy fix available

### Problem 5: Unable to Fix Critical

**Symptomy:**
- npm audit fix fails
- No automatic fix available
- Critical vulnerability

**Rozwiązanie:**

**Priority workflow:**
```
1. Check npm package page
   → New version available?
   → Workaround in release notes?

2. Search for alternative packages
   → npm search <functionality>
   → Check GitHub stars, maintenance

3. Vendor fork (last resort)
   → Fork vulnerable package
   → Apply security patch
   → Use local/private version
   → Monitor upstream

4. Risk acceptance (extreme last resort)
   → Document in SECURITY.md
   → Add monitoring
   → Plan migration
   → Executive approval required
```

---

## 📚 Zasoby i Linki

### Dokumentacja

- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [npm audit](https://docs.npmjs.com/cli/v9/commands/npm-audit)

### Security Feeds

- [CISA KEV Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) - Aktywnie eksploatowane CVE
- [GitHub Advisory Database](https://github.com/advisories)
- [Snyk Vulnerability DB](https://security.snyk.io/)
- [NPM Security Advisories](https://www.npmjs.com/advisories)

### Narzędzia

- [Socket.dev](https://socket.dev/) - Real-time security monitoring
- [Snyk](https://snyk.io/) - Continuous security scanning
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)

---

## 🔄 Maintenance i Updates

### Co Tydzień
- ✅ Review nowych Dependabot PRs
- ✅ Check automated workflow success rate
- ✅ Update ACTIVELY_EXPLOITED list from CISA

### Co Miesiąc
- ✅ Review unfixed vulnerabilities
- ✅ Update documentation
- ✅ Check for new GitHub Actions versions
- ✅ Review false positives

### Co Kwartał
- ✅ Full security audit
- ✅ Review ignored dependencies
- ✅ Update security policies
- ✅ Team training on new threats

---

## 📞 Support i Kontakt

**Security Issues:**
- 🔐 Private: security@cyberchef.org (jeśli skonfigurowane)
- 📧 GitHub Security Advisory (private disclosure)

**General Questions:**
- 💬 GitHub Discussions
- 🐛 GitHub Issues (non-security)

**Emergency Hotline:**
- 🚨 Critical vulnerabilities: Escalate to @security-team via Issue

---

## ✅ Checklist Wdrożenia

```
Przed wdrożeniem do produkcji:

Infrastructure:
☐ GitHub Actions enabled
☐ Dependabot enabled
☐ Branch protection rules set
☐ Permissions configured

Workflows:
☐ security-auto-fix.yml tested
☐ dependency-review.yml tested
☐ codeql-analysis.yml tested
☐ All workflows enabled

Scripts:
☐ vulnerability-triage.js executable
☐ security-fix.sh executable
☐ Tested locally

Documentation:
☐ Team briefed on workflows
☐ Response procedures documented
☐ Escalation paths defined

Monitoring:
☐ Email notifications configured
☐ Security tab monitored
☐ Metrics dashboard created (optional)

Testing:
☐ Create test PR with vulnerability
☐ Verify dependency-review blocks it
☐ Verify auto-fix creates PR
☐ Verify alerts created for unfixable

Post-Deployment:
☐ First week: Daily monitoring
☐ First month: Weekly reviews
☐ Ongoing: Monthly maintenance
```

---

**Ostatnia Aktualizacja:** 2025-12-18
**Wersja:** 1.0
**Status:** ✅ PRODUCTION READY
