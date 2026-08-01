// email.ts is a server module; we stub server-only and the SMTP transport so we
// can assert what message would be sent without touching a real mail server.
jest.mock("server-only", () => ({}));

const sendMail = jest.fn().mockResolvedValue({ messageId: "test" });
jest.mock("nodemailer", () => ({
  __esModule: true,
  default: { createTransport: jest.fn(() => ({ sendMail })) },
}));

// The provider is chosen from env at import time, so load the module fresh with
// SMTP credentials present to exercise the SMTP path.
async function loadEmailWithSmtp() {
  jest.resetModules();
  process.env.SMTP_USER = "farm@example.com";
  process.env.SMTP_PASS = "app-password";
  return import("@/lib/email");
}

describe("email content & delivery", () => {
  beforeEach(() => sendMail.mockClear());

  it("puts the OTP code in both the subject and the body", async () => {
    const { sendOtpEmail } = await loadEmailWithSmtp();
    const res = await sendOtpEmail("customer@example.com", "482913");

    expect(res.delivered).toBe(true);
    const msg = sendMail.mock.calls[0][0];
    expect(msg.to).toBe("customer@example.com");
    expect(msg.subject).toContain("482913");
    expect(msg.html).toContain("482913");
  });

  it("builds an order confirmation with the order number and formatted total", async () => {
    const { sendOrderConfirmationEmail } = await loadEmailWithSmtp();
    await sendOrderConfirmationEmail("customer@example.com", {
      id: "o1",
      orderNumber: "CC-1042",
      total: 15000,
      fulfillment: "delivery",
      date: "2026-08-10",
      paymentMethod: "cod",
    });

    const msg = sendMail.mock.calls[0][0];
    expect(msg.subject).toContain("CC-1042");
    expect(msg.html).toContain("CC-1042");
    expect(msg.html).toContain("Rs. 15,000");
    expect(msg.html).toContain("Cash on delivery");
  });

  it("reports failure gracefully when the transport throws", async () => {
    const { sendOtpEmail } = await loadEmailWithSmtp();
    sendMail.mockRejectedValueOnce(new Error("connection refused"));

    const res = await sendOtpEmail("x@example.com", "111111");
    expect(res.delivered).toBe(false);
    expect(res.error).toMatch(/SMTP/);
  });

  it("does not deliver when no email provider is configured", async () => {
    jest.resetModules();
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.RESEND_API_KEY;

    const { sendOtpEmail, hasEmailProvider } = await import("@/lib/email");
    expect(hasEmailProvider).toBe(false);
    expect((await sendOtpEmail("x@example.com", "111111")).delivered).toBe(false);
  });
});
