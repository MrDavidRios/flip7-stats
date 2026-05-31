const ACCENT_HUES = [12, 55, 85, 155, 195, 250, 290, 330];

const FEATURED = {
  light: { bg: "oklch(0.88 0.08 85)", border: "oklch(0.75 0.14 85)" },
  dark: { bg: "oklch(0.30 0.06 85)", border: "oklch(0.50 0.10 85)" },
};

const CHART_HUES = [255, 15, 155];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function deriveAccentVars(hue: number, dark: boolean): Record<string, string> {
  if (dark) {
    return {
      "--accent": `oklch(0.30 0.08 ${hue})`,
      "--accent-bg": `oklch(0.30 0.08 ${hue} / 0.15)`,
      "--accent-border": `oklch(0.55 0.12 ${hue} / 0.5)`,
      "--primary": `oklch(0.75 0.16 ${hue})`,
      "--primary-foreground": "oklch(0.205 0 0)",
      "--ring": `oklch(0.65 0.13 ${hue})`,
      "--sidebar-primary": `oklch(0.75 0.16 ${hue})`,
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
    };
  }
  return {
    "--accent": `oklch(0.95 0.03 ${hue})`,
    "--accent-bg": `oklch(0.65 0.18 ${hue} / 0.10)`,
    "--accent-border": `oklch(0.65 0.18 ${hue} / 0.5)`,
    "--background": `oklch(0.89 0.11 84.2)`,
    "--card": `oklch(0.89 0.11 84.2)`,
    "--primary": `oklch(0.45 0.18 ${hue})`,
    "--primary-foreground": "oklch(0.985 0 0)",
    "--ring": `oklch(0.55 0.15 ${hue})`,
    "--muted": `oklch(0.8 0.12 83.9)`,
    "--sidebar-primary": `oklch(0.45 0.18 ${hue})`,
    "--sidebar-primary-foreground": "oklch(0.985 0 0)",
  };
}

function deriveFeaturedVars(dark: boolean): Record<string, string> {
  const f = dark ? FEATURED.dark : FEATURED.light;
  return {
    "--featured-bg": f.bg,
    "--featured-border": f.border,
  };
}

function deriveChartVars(dark: boolean): Record<string, string> {
  const base = dark ? 0.65 : 0.55;
  const step = dark ? -0.08 : -0.07;
  const chroma = dark ? 0.10 : 0.12;
  const vars: Record<string, string> = {};
  for (let i = 0; i < 5; i++) {
    const hue = CHART_HUES[i % CHART_HUES.length];
    const l = base + step * i;
    vars[`--chart-${i + 1}`] = `oklch(${l.toFixed(3)} ${chroma} ${hue})`;
  }
  return vars;
}

const accentHue = pickRandom(ACCENT_HUES);

function applyTheme() {
  const dark = false; // Dark mode disabled for now. To re-enable: window.matchMedia("(prefers-color-scheme: dark)").matches
  const el = document.documentElement;

  el.classList.toggle("dark", dark);

  const vars = {
    ...deriveAccentVars(accentHue, dark),
    ...deriveFeaturedVars(dark),
    ...deriveChartVars(dark),
  };

  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value);
  }
}

applyTheme();
