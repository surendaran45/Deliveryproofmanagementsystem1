# Security checklist

This application handles authentication credentials, delivery addresses, GPS coordinates, photographs, and OTPs. This checklist is a release gate, not a claim that the current application has passed a security audit.

## Required before production

- [ ] Replace any fallback/default JWT secret with a required, high-entropy secret stored only in Supabase Edge Function secrets. Fail closed when required configuration is missing.
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Never expose it through Vite variables, client bundles, logs, or repository files.
- [ ] Enable Row Level Security (RLS) on every exposed table and write policies for least-privilege access. Do not use disabled RLS as a production configuration.
- [x] Public registration now rejects requests for the `admin` role. Provision administrators through a trusted, separately authorized process; this project does not expose a public admin-creation endpoint.
- [ ] Restrict CORS to known frontend origins and keep authorization checks on the server; CORS is not an access-control mechanism.
- [ ] Store OTPs safely, use cryptographically secure generation, limit verification attempts, set expiry, avoid logging them, and never expose them to unauthorized users. The code now uses Web Crypto for generation and checks that a driver can only verify an OTP for their own delivery; expiry and attempt limits still need implementation.
- [ ] Validate and normalize request fields server-side, including email, name, delivery IDs, coordinates, image size/type, and state transitions.
- [ ] Return generic client-facing errors; log diagnostic details without credentials, tokens, OTPs, photos, or unnecessary personal data.
- [ ] Review photo storage and retention. Prefer object storage with private access and short-lived signed URLs over large base64 values in database rows.
- [ ] Use HTTPS, rotate any potentially exposed secrets, and audit dependencies and Supabase policies before release.

## Development data

The repository has historically included example credentials in its documentation and development-oriented database instructions. Do not reuse these credentials in a real environment. Create unique test accounts and rotate any credentials that may have been used outside a local demo.

## Reporting

Do not publish real secrets, tokens, private delivery photos, or customer data in issues. If a credential was committed, revoke/rotate it first; deleting it from the latest commit does not invalidate it.
