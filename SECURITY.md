# Security Policy

## Supported Versions

CyberChef is supported on a best endeavours basis. Patches will be applied to
the latest version rather than retroactively to older versions. To ensure you
are using the most secure version of CyberChef, please make sure you have the
[latest release](https://github.com/gchq/CyberChef/releases/latest). The
official [live demo](https://gchq.github.io/CyberChef/) is always up to date.

## Reporting a Vulnerability

In most scenarios, the most appropriate way to report a vulnerability is to
[raise a new issue](https://github.com/gchq/CyberChef/issues/new/choose)
describing the problem in as much detail as possible, ideally with examples.
This will obviously be public. If you feel that the vulnerability is
significant enough to warrant a private disclosure, please email
[oss@gchq.gov.uk](mailto:oss@gchq.gov.uk) and
[n1474335@gmail.com](mailto:n1474335@gmail.com).

Disclosures of vulnerabilities in CyberChef are always welcomed. Whilst we aim
to write clean and secure code free from bugs, we recognise that this is an open
source project written by analysts in their spare time, relying on dozens of
open source libraries that are modified and updated on a regular basis. We hope
that the community will continue to support us as we endeavour to maintain and
develop this tool together.

## Security Context and Threat Model

### What CyberChef Is

CyberChef is a **client-side cryptographic and data manipulation tool** designed for:
- Security professionals and analysts
- Reverse engineering
- Educational purposes
- Data encoding/decoding operations

### What CyberChef Is NOT

CyberChef is **not**:
- A multi-tenant web application
- A system that stores user data
- An authentication/authorization system
- A production backend service

### Implications for Security

Due to CyberChef's nature as an analyst tool:

1. **Intentional "Weak" Crypto**: Many operations implement legacy or weak cryptographic algorithms (MD5, DES, etc.) for:
   - Compatibility with older systems
   - Reverse engineering capabilities
   - Educational demonstrations
   - **This is by design and not a vulnerability**

2. **Intentional Deserialization**: Operations like PHP Deserialize, JSON parsing, etc. are meant to decode potentially untrusted data:
   - Users are security professionals who understand the risks
   - The tool runs client-side in the user's browser
   - **This is the intended functionality**

3. **Limited XSS Risk**:
   - All data input/output is controlled by the user
   - No multi-user environment
   - No stored data that could be exploited
   - **Traditional XSS threat models don't fully apply**

## CodeQL and Static Analysis Findings

### Known Exceptions

CyberChef may show findings in static analysis tools (CodeQL, ESLint, etc.) that are marked as exceptions. Common categories include:

#### 1. Incomplete Sanitization
**Status**: Accepted
**Reason**: Operations are intentional encoding/decoding tools. "Incomplete" sanitization is expected behavior for compatibility.
**Examples**: PHPDeserialize, JSONBeautify operations

#### 2. Weak Cryptography
**Status**: Accepted
**Reason**: CyberChef implements many legacy algorithms intentionally for reverse engineering and compatibility.
**Examples**: MD5, DES, RC4 operations

#### 3. DOM innerHTML Usage
**Status**: Reviewed
**Reason**: Help system and output display use innerHTML for formatted content. All content is either:
- Hardcoded in source code (help text)
- User-provided data displayed back to same user
**Examples**: Help modal, HTML output display

### Reviewing Findings

When reviewing security findings for CyberChef:

1. **Consider the context**: Is this a tool for analysts or a production app?
2. **Check annotations**: Look for `lgtm [rule-id]` comments indicating reviewed exceptions
3. **Refer to documentation**: See `CODEQL_FINDINGS_ASSESSMENT.md` for detailed analysis
4. **Assess actual risk**: Would fixing this break intended functionality?

### Suppression Comments

Code marked with suppression comments (e.g., `lgtm [js/incomplete-sanitization]`) has been reviewed and accepted. These annotations mean:
- The finding has been analyzed
- The behavior is intentional
- The security implications are understood and accepted
- The code should not be "fixed" without understanding the context

For detailed analysis of specific findings, see: `CODEQL_FINDINGS_ASSESSMENT.md`
