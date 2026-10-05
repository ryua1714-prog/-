import { loadFont } from "@remotion/fonts";
import { staticFile, useVideoConfig } from "remotion";

// M PLUS Rounded 1c（SIL Open Font License）を public/fonts から読み込む
const family = "M PLUS Rounded 1c";
export const fontFamily = `"${family}", sans-serif`;
loadFont({ family, url: staticFile("fonts/MPLUSRounded1c-Medium.ttf"), weight: "500" });
loadFont({ family, url: staticFile("fonts/MPLUSRounded1c-ExtraBold.ttf"), weight: "800" });

export const colors = {
  bg: "#fff8ee",
  text: "#3a332c",
  muted: "#8a7f72",
  accent: "#e07a3f",
  accentDeep: "#b65a25",
  pink: "#f6a6b2",
  yellow: "#ffd25e",
  mint: "#7fd6c0",
  sky: "#8fc6f2",
  lavender: "#c3a8ef",
};

// js/data.js のタイプとカラー
export const TYPES = [
  { emoji: "🦉", label: "教育型", role: "設計者", color: "#2f5d9e", soft: "#e4ecf8" },
  { emoji: "🐱", label: "個性型", role: "プロデューサー", color: "#8b64c9", soft: "#eee7fa" },
  { emoji: "🐴", label: "自立型", role: "相談役", color: "#2a9a7f", soft: "#e0f3ec" },
  { emoji: "🐒", label: "挑戦型", role: "応援団長", color: "#ee7d1f", soft: "#fdecd9" },
  { emoji: "🐶", label: "社会型", role: "指導者", color: "#d4a21a", soft: "#faf1d2" },
  { emoji: "🐨", label: "安心型", role: "保護者", color: "#d98f93", soft: "#f9ebe6" },
  { emoji: "🐯", label: "努力型", role: "監督", color: "#d4422a", soft: "#fbe2dc" },
  { emoji: "🦊", label: "戦略型", role: "軍師", color: "#4d8291", soft: "#e2edf0" },
];

export const AXES = ["学び", "個性", "成長", "礼儀", "安定"];

// 縦型（9:16）かどうか
export const usePortrait = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};
