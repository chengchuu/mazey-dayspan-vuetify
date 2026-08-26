import { ESLint } from "eslint";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ESLint formatting configuration", () => {
  it("wraps long imports without introducing trailing whitespace", async () => {
    const source = "import { first, second, third, fourth } from \"example\";\nvoid [first,second,third,fourth];\n";
    const [result] = await new ESLint({ fix:true }).lintText(source, {
      filePath:resolve("src/eslint-fixture.ts"),
    });

    expect(result?.messages).toEqual([]);
    expect(result?.output).toContain("import {\n  first, second, third, fourth,\n} from \"example\";");
    expect(result?.output).not.toMatch(/[ \t]+$/mu);
  }, 15_000);
});
