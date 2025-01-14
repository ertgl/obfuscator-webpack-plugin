import "@testing-library/jest-dom/jest-globals";
import {
  describe,
  expect,
  it,
} from "@jest/globals";
import {
  render,
  screen,
} from "@testing-library/react";

import Page from "../../../src/app/page";

describe(
  "Page", () =>
  {
    it("should contain the text 'It works!'", () =>
    {
      render(<Page />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("It works!");
    });
  });
