export type IssueRequest = { productId: string; buyerEmail: string };
export type VerifyRequest = { productId: string; licenseKey: string };
export type LicenseRecord = { productId: string; email: string; key: string; issuedAt: number };
