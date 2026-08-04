import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Cấu hình HTML Report để hiển thị MSSV
  reporter: [
    ["list"],
    [
      "html",
      {
        open: "never",
        title: "EShop Automation Report - Run by: 23127503",
      },
    ],
  ],

  use: {
    trace: "on-first-retry",
    screenshot: "on",
    video: "on",
  },

  // Cấu hình chạy trên 3 trình duyệt
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "edge",
      use: {
        ...devices["Desktop Edge"],
        channel: "msedge",
      },
    },
  ],
});
