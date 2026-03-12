import { useTheme } from "@/context/ThemeContext";

/** Returns true when the classic (office) theme is active */
export function useIsClassic() {
  const { theme } = useTheme();
  return theme === "classic";
}
