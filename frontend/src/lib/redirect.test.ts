import { describe, expect, it } from "vitest";
import { safeNextPath, withNext } from "./redirect";

describe("safeNextPath", () => {
  it("aceita caminhos locais", () => {
    expect(safeNextPath("/animais/cadastrar")).toBe("/animais/cadastrar");
  });

  it("rejeita URLs externas e caminhos com protocolo", () => {
    expect(safeNextPath("https://site-externo.com")).toBe("/");
    expect(safeNextPath("//site-externo.com")).toBe("/");
    expect(safeNextPath("/\\site-externo.com")).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
  });

  it("usa o primeiro valor quando recebe uma lista", () => {
    expect(safeNextPath(["/meus-animais", "/outro"])).toBe("/meus-animais");
  });
});

describe("withNext", () => {
  it("omite o parâmetro quando o destino é a home", () => {
    expect(withNext("/login", "/")).toBe("/login");
  });

  it("codifica o destino", () => {
    expect(withNext("/cadastro", "/meus animais")).toBe("/cadastro?next=%2Fmeus%20animais");
  });
});
