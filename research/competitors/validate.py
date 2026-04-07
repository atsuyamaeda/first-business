#!/usr/bin/env python3
"""matcha_cafes.md schema検証スクリプト

schema.md で定義された35列のテーブル構造と制約を検証し、不整合を出力する。
"""
import re
import sys
from pathlib import Path

MD_PATH = Path(__file__).parent / 'matcha_cafes.md'
HEADERS = ['id','店名','ブランド名','住所','区','エリア','GoogleマップURL','情報ソース','データ取得日','備考',
     '階','公式サイトURL','InstagramURL','IGフォロワー数','IGハッシュタグ投稿数','TikTokURL','YouTubeURL','運営会社URL',
     'Google評価','Googleレビュー件数','食べログURL','食べログ評価','食べログレビュー件数',
     '抹茶専門性','業態タグ','最寄駅','駅徒歩分','抹茶ラテ価格','単品抹茶価格','茶筅点て提供','産地・銘柄表記',
     '抹茶メニューリスト','確度','営業状態','開店日']
WARDS_10 = {'江東区','台東区','港区','目黒区','品川区','世田谷区','杉並区','新宿区','中野区','豊島区'}
KAKUDO_OK = {'確実','要確認','不明','除外候補'}

def main():
    with MD_PATH.open() as f:
        lines = f.read().split('\n')
    rows = []
    seen_ids = set()
    seen_urls = {}
    issues = []
    for ln, line in enumerate(lines, 1):
        if not line.startswith('| '): continue
        cells = line.split('|')
        if len(cells) < 36 or not cells[1].strip().isdigit(): continue
        vals = [c.strip() for c in cells[1:36]]
        d = dict(zip(HEADERS, vals))
        sid = d['id']
        # 1. ID dup
        if sid in seen_ids:
            issues.append((ln, sid, 'DUP_ID', f'重複 id={sid}'))
        seen_ids.add(sid)
        # 2. Required Phase A: id, 店名, GoogleマップURL
        if not d['店名']:
            issues.append((ln, sid, 'MISSING_NAME', '店名空欄'))
        if 'maps/place' not in d['GoogleマップURL']:
            issues.append((ln, sid, 'BAD_MAPS_URL', f'place URL未設定: "{d["GoogleマップURL"][:60]}"'))
        # 3. Maps URL dup
        url = d['GoogleマップURL']
        if 'maps/place' in url:
            key = re.sub(r'\?.*$', '', url.split('/data=')[0])
            if key in seen_urls:
                issues.append((ln, sid, 'DUP_MAPS_URL', f'重複URL (id {seen_urls[key]} と)'))
            else:
                seen_urls[key] = sid
        # 4. 区 in 10 wards or marked 除外候補
        if d['区'] and d['区'] not in WARDS_10 and d['確度'] != '除外候補':
            issues.append((ln, sid, 'OUT_OF_WARDS', f'10区外({d["区"]})なのに除外候補ではない'))
        # 5. 確度 valid value
        if d['確度'] and d['確度'] not in KAKUDO_OK:
            issues.append((ln, sid, 'BAD_KAKUDO', f'不正な確度値: {d["確度"]}'))
        # 6. 営業状態 format
        es = d['営業状態']
        if es and es not in ('営業中','閉店(日付不明)','要確認'):
            if not re.match(r'^\d{4}(-\d{2})?(-\d{2})?$', es):
                if '閉店' not in es:
                    issues.append((ln, sid, 'BAD_STATUS', f'営業状態フォーマット不正: {es}'))
        # 7. Phone home: 抹茶メニューリスト 必須
        if not d['抹茶メニューリスト']:
            issues.append((ln, sid, 'NO_MENU_LIST', '抹茶メニューリスト空欄'))
        # 8. tabelog URL has tabelog.com
        if d['食べログURL'] and 'tabelog.com' not in d['食べログURL']:
            issues.append((ln, sid, 'BAD_TABELOG_URL', d['食べログURL'][:60]))
        rows.append(d)

    # Print
    print(f'=== matcha_cafes.md 検証結果 ===')
    print(f'総行数: {len(rows)}')
    print(f'問題件数: {len(issues)}')
    by_type = {}
    for issue in issues:
        by_type.setdefault(issue[2], []).append(issue)
    for t, items in sorted(by_type.items(), key=lambda x: -len(x[1])):
        print(f'\n[{t}] {len(items)}件')
        for ln, sid, _, msg in items[:10]:
            print(f'  L{ln} id={sid}: {msg}')
        if len(items) > 10:
            print(f'  ... +{len(items)-10}件')

    # Coverage summary
    print(f'\n=== カバレッジ ===')
    for h in HEADERS:
        n = sum(1 for r in rows if r[h] and r[h] != '不明')
        print(f'  {h:<25} {n:>4}/{len(rows)} ({n*100//len(rows)}%)')

    return 1 if issues else 0

if __name__ == '__main__':
    sys.exit(main())
