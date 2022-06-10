/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

// @vitest-environment jsdom

import { enforce, createNode } from "../src/module/util";

describe("enforce", function () {
  it("should not throw for truthy values", () => {
    enforce(true);
  });
  it("should throw for falsy values", () => {
    expect(() => enforce(false)).toThrow();
  });
});

describe("createNode", function () {
  it("should create an empty div", () => {
    const node = createNode("div");
    expect(node.tagName).toBe("DIV");
    expect(node.innerHTML).toBe("");
  });
  it("should create a span with text", () => {
    const node = createNode("span", { children: "text" });
    expect(node.tagName).toBe("SPAN");
    expect(node.innerHTML).toBe("text");
  });
  it("should create a span with text and attributes", () => {
    const node = createNode("span", {
      children: "text",
      attributes: {
        class: "class",
        id: "id",
      },
    });
    expect(node.tagName).toBe("SPAN");
    expect(node.innerHTML).toBe("text");
    expect(node.className).toBe("class");
    expect(node.id).toBe("id");
  });
  it("should create a div with data-* attributes", () => {
    const node = createNode("div", {
      attributes: {
        "data-test": "test",
      },
    });
    expect(node.tagName).toBe("DIV");
    expect(node.dataset.test).toBe("test");
  });
  it("should create a div with html content", () => {
    const node = createNode("div", {
      html: "<span>text</span>",
    });
    expect(node.tagName).toBe("DIV");
    expect(node.innerHTML).toBe("<span>text</span>");
  });
});
