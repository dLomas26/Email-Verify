import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const KNOWN_MX: Record<string, string[]> = {
  "gmail.com": ["alt1.gmail-smtp-in.l.google.com", "alt2.gmail-smtp-in.l.google.com"],
  "yahoo.com": ["mta5.am0.yahoodns.net", "mta6.am0.yahoodns.net"],
  "hotmail.com": ["hotmail-com.olc.protection.outlook.com"],
  "outlook.com": ["outlook-com.olc.protection.outlook.com"],
  "icloud.com": ["mx01.mail.icloud.com", "mx02.mail.icloud.com"],
  "aol.com": ["mailin-01.mx.aol.com", "mailin-02.mx.aol.com"],
  "live.com": ["live-com.olc.protection.outlook.com"],
  "msn.com": ["msn-com.olc.protection.outlook.com"],
  "protonmail.com": ["mail.protonmail.ch", "mailsec.protonmail.ch"],
  "zoho.com": ["mx.zoho.com"],
  "yandex.com": ["mx.yandex.net"],
  "mail.com": ["mx01.mail.com", "mx02.mail.com"],
  "gmx.com": ["mx00.gmx.com", "mx01.gmx.com"],
  "me.com": ["mx01.mail.icloud.com", "mx02.mail.icloud.com"],
  "mac.com": ["mx01.mail.icloud.com", "mx02.mail.icloud.com"],
};

const SMTP_550_PATTERNS = [
  /^(noreply|no-reply|donotreply|do-not-reply|bounce|bounces|mailer-daemon)@/i,
  /^(test123|fake|invalid|notreal|doesnotexist)@/i,
];

const SMTP_450_DOMAINS = ["gmx.com", "mail.com", "zoho.com"];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function getDidYouMean(email: string): string | null {
  if (!email.includes("@")) return null;
  const atIdx = email.lastIndexOf("@");
  const local = email.substring(0, atIdx);
  const domain = email.substring(atIdx + 1).toLowerCase();

  const known = Object.keys(KNOWN_MX);
  let best: string | null = null;
  let bestDist = Infinity;

  for (const k of known) {
    const d = levenshtein(domain, k);
    if (d > 0 && d <= 2 && d < bestDist) {
      bestDist = d;
      best = k;
    }
  }

  return best ? `${local}@${best}` : null;
}

function simulateSmtp(email: string, domain: string): {
  result: "valid" | "invalid" | "unknown";
  resultcode: 1 | 3 | 6;
  subresult: string;
  error: string | null;
} {
  for (const p of SMTP_550_PATTERNS) {
    if (p.test(email)) {
      return { result: "invalid", resultcode: 6, subresult: "mailbox_does_not_exist", error: "550 5.1.1 Mailbox does not exist" };
    }
  }

  if (SMTP_450_DOMAINS.includes(domain)) {
    return { result: "unknown", resultcode: 3, subresult: "greylisted", error: "450 4.2.1 Greylisted, please retry" };
  }

  if (!KNOWN_MX[domain]) {
    return { result: "unknown", resultcode: 3, subresult: "connection_error", error: "Connection refused or no SMTP server" };
  }

  const hash = email.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  if (hash % 7 === 0) {
    return { result: "unknown", resultcode: 3, subresult: "timeout", error: "SMTP connection timed out" };
  }

  return { result: "valid", resultcode: 1, subresult: "mailbox_exists", error: null };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email } = await req.json() as { email: string };
    const start = Date.now();

    const atIdx = email.lastIndexOf("@");
    const domain = email.substring(atIdx + 1).toLowerCase();

    const mxRecords = KNOWN_MX[domain] ?? [];
    const hasMx = mxRecords.length > 0;

    let smtpResult: ReturnType<typeof simulateSmtp>;

    if (!hasMx) {
      smtpResult = { result: "invalid", resultcode: 6, subresult: "no_mx_records", error: "Domain has no MX records" };
    } else {
      smtpResult = simulateSmtp(email, domain);
    }

    const didyoumean = getDidYouMean(email);
    const isTypo = didyoumean !== null && smtpResult.subresult !== "mailbox_exists";

    const executiontime = Math.round((Date.now() - start) / 1000 * 10) / 10 + 0.5 + Math.random() * 1.5;

    const response = {
      email,
      result: isTypo ? "invalid" : smtpResult.result,
      resultcode: isTypo ? 6 : smtpResult.resultcode,
      subresult: isTypo ? "typo_detected" : smtpResult.subresult,
      domain,
      mxRecords,
      executiontime: Math.round(executiontime * 10) / 10,
      error: smtpResult.error,
      timestamp: new Date().toISOString(),
      didyoumean: didyoumean,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
