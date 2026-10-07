import {
  MISSING_PRINTED_VALUE,
  type PrintedUnit,
} from "../src/lib/schema.ts";

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export type ParsedPrintedValue =
  | { kind: "missing" }
  | { kind: "money"; amount_nu: bigint }
  | { kind: "pct"; pct: string };

const UNSIGNED_NUMBER = /^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/;

export function parsePrintedValue(
  printed_value: string,
  printed_unit: PrintedUnit,
): ParsedPrintedValue {
  const trimmed = printed_value.trim();
  if (trimmed === MISSING_PRINTED_VALUE) {
    return { kind: "missing" };
  }

  const { negative, inner } = unwrapSign(trimmed);
  const { hasPercent, mantissa } = stripPercent(inner);

  if (!UNSIGNED_NUMBER.test(mantissa)) {
    throw new ParseError(
      `printed_value ${JSON.stringify(printed_value)} is not a number pattern`,
    );
  }

  if (printed_unit === "% of GDP") {
    const pct = `${negative ? "-" : ""}${stripCommas(mantissa)}`;
    return { kind: "pct", pct };
  }

  if (hasPercent) {
    throw new ParseError(
      `printed_value ${JSON.stringify(printed_value)} has % but unit is ${printed_unit}`,
    );
  }

  const scale = printed_unit === "Nu. million" ? 6 : 0;
  const magnitude = decimalStringToInteger(mantissa, scale);
  const amount_nu = negative ? -magnitude : magnitude;
  return { kind: "money", amount_nu };
}

function unwrapSign(raw: string): { negative: boolean; inner: string } {
  if (raw.startsWith("(") && raw.endsWith(")")) {
    return { negative: true, inner: raw.slice(1, -1).trim() };
  }
  if (raw.startsWith("-")) {
    return { negative: true, inner: raw.slice(1).trim() };
  }
  return { negative: false, inner: raw };
}

function stripPercent(raw: string): { hasPercent: boolean; mantissa: string } {
  if (raw.endsWith("%")) {
    return { hasPercent: true, mantissa: raw.slice(0, -1).trim() };
  }
  return { hasPercent: false, mantissa: raw };
}

function stripCommas(value: string): string {
  return value.replaceAll(",", "");
}

function decimalStringToInteger(unsigned: string, scale: number): bigint {
  const stripped = stripCommas(unsigned);
  const dot = stripped.indexOf(".");
  const whole = dot === -1 ? stripped : stripped.slice(0, dot);
  const frac = dot === -1 ? "" : stripped.slice(dot + 1);

  if (frac.length > scale) {
    const extra = frac.slice(scale);
    if (/[1-9]/.test(extra)) {
      throw new ParseError(
        `printed_value has more than ${scale} decimal places and cannot become whole ngultrum without rounding`,
      );
    }
  }

  const fracPadded = frac.padEnd(scale, "0").slice(0, scale);
  const digits = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, "") || "0";
  return BigInt(digits);
}
