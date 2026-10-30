import { renderUnicodeCompact } from "@opencode/util/qr"
import { expect, test } from "bun:test"
import { EOL } from "os"
import { pairingOutput } from "../src/commands/handlers/pair"

const pairing = { code: "abc", expires_in: 300 }

const qrCode = (value: string) =>
  renderUnicodeCompact(value, { border: 2 })
    .split("\n")
    .map((line) => "  " + line)
    .join(EOL)

test("gives the browser a plain link QR code and the app its JSON QR code", () => {
  const output = pairingOutput(pairing, ["http://127.0.0.1:49374", "https://example.opentunnel.xyz"])
  const browser = output.indexOf("  Browser")
  const app = output.indexOf("  iOS app")

  expect(browser).toBeGreaterThan(-1)
  expect(app).toBeGreaterThan(browser)
  expect(output.indexOf(qrCode("https://example.opentunnel.xyz/auth/connect/abc"))).toBeGreaterThan(browser)
  expect(output.indexOf(qrCode("https://example.opentunnel.xyz/auth/connect/abc"))).toBeLessThan(app)
  expect(
    output.indexOf(qrCode(JSON.stringify({ code: "abc", urls: ["https://example.opentunnel.xyz"] }))),
  ).toBeGreaterThan(app)
})

test("prints only links when no address is reachable from another device", () => {
  const output = pairingOutput(pairing, ["http://127.0.0.1:49374"])

  expect(output).toContain("http://127.0.0.1:49374/auth/connect/abc")
  expect(output).not.toContain("iOS app")
  expect(output).not.toContain("█")
})
