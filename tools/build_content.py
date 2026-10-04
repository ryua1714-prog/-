#!/usr/bin/env python3
"""content/questions.md と content/results.md から js/content.js を生成する。

質問文・結果文章は原稿の文字をそのまま使う（加工しない）。
使い方: python3 tools/build_content.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TYPE_KEYS = {
    "教育": "education",
    "個性": "individuality",
    "自立": "independence",
    "挑戦": "challenge",
    "社会": "social",
    "安心": "security",
    "努力": "effort",
    "戦略": "strategy",
}

SECTION_TITLES = [
    "どんなタイプ？",
    "どんな子どもに育ちやすい？",
    "どんなことに気をつける？",
    "子どもと衝突しやすい場面",
    "あなたに合った子育て環境",
    "あなたの強み",
    "あなたの弱み",
    "相性のいいタイプ",
    "同じタイプのキャラ・有名人",
    "あなたへのアドバイス",
]

# 「同じタイプのキャラ・有名人」の中で見出しとして表示する名前
CHARACTER_NAMES = {
    "孔子", "のび太ママ（ドラえもん）",
    "坂本龍馬", "殺せんせー（暗殺教室）",
    "吉田松陰", "シャンクス（ワンピース）",
    "豊臣秀吉", "オーキド博士（ポケットモンスター）",
    "イエス・キリスト", "竈門炭治郎（鬼滅の刃）",
    "釈迦", "野原ひろし（クレヨンしんちゃん）",
    "徳川家康", "北信介（ハイキュー!!）",
    "諸葛孔明", "アルミン・アルレルト（進撃の巨人）",
}


def parse_questions(text):
    head, table = text.split("## タイプ判定用の配点")
    questions = re.findall(r"^Q(\d+)\n(.+)$", head, flags=re.M)
    assert [int(n) for n, _ in questions] == list(range(1, 51)), "質問番号が1〜50になっていません"

    def parse_side(side):
        out = {}
        for name, value in re.findall(r"(教育|個性|自立|挑戦|社会|安心|努力|戦略)\+(\d)", side):
            out[TYPE_KEYS[name]] = int(value)
        return out

    weights = {}
    for n, pos, neg in re.findall(r"^Q(\d+)\s+肯定:(.+?) / 否定:(.+)$", table, flags=re.M):
        weights[int(n)] = (parse_side(pos), parse_side(neg))
    assert sorted(weights) == list(range(1, 51)), "配点が50問分ありません"

    return [{"text": t, "pos": weights[int(n)][0], "neg": weights[int(n)][1]} for n, t in questions]


def parse_results(text):
    header = re.compile(r"^(教育|個性|自立|挑戦|社会|安心|努力|戦略)型｜(.+) (\S+)$")
    results = {}
    current = None
    section = None
    for line in text.split("\n"):
        m = header.match(line)
        if m:
            current = {"intro": [], "sections": []}
            results[TYPE_KEYS[m.group(1)]] = current
            section = None
            continue
        if current is None or line == "":
            continue
        if line in SECTION_TITLES:
            section = {"title": line, "items": []}
            current["sections"].append(section)
            continue
        if section is None:
            current["intro"].append(line)
        elif section["title"] == "同じタイプのキャラ・有名人" and line in CHARACTER_NAMES:
            section["items"].append({"name": line})
        else:
            section["items"].append({"p": line})

    assert len(results) == 8, "8タイプ分の原稿がありません"
    for key, r in results.items():
        titles = [s["title"] for s in r["sections"]]
        assert titles == SECTION_TITLES, f"{key} の見出しが揃っていません: {titles}"
        names = [i["name"] for i in r["sections"][8]["items"] if "name" in i]
        assert len(names) == 2, f"{key} のキャラ・有名人が2件ではありません: {names}"
    return results


def main():
    questions = parse_questions((ROOT / "content/questions.md").read_text(encoding="utf-8"))
    results = parse_results((ROOT / "content/results.md").read_text(encoding="utf-8"))
    js = (
        "// このファイルは tools/build_content.py で content/*.md から生成しています。直接編集しないでください。\n\n"
        "// pos: 肯定方向（そう思う側）で加点するタイプ / neg: 否定方向（そう思わない側）で加点するタイプ\n"
        f"const QUESTIONS = {json.dumps(questions, ensure_ascii=False, indent=2)};\n\n"
        "// 結果文章（content/results.md が唯一の正式原稿）\n"
        f"const RESULTS = {json.dumps(results, ensure_ascii=False, indent=2)};\n"
    )
    (ROOT / "js/content.js").write_text(js, encoding="utf-8")
    print(f"js/content.js: {len(questions)} questions, {len(results)} result texts")


if __name__ == "__main__":
    main()
