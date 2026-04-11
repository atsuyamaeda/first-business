#!/usr/bin/env python3
"""matcha_cafes.md schema検証スクリプト (23列版)"""
import re
import sys
from pathlib import Path

MD_PATH = Path(__file__).parent / 'matcha_cafes.md'
HEADERS = ['id', '店名', 'ブランド名', 'エリア', '開店日', '食べログ評価', '食べログレビュー件数', 'Google評価', 'Googleレビュー件数', 'IGフォロワー数', 'GoogleマップURL', '食べログURL', 'InstagramURL', '公式サイトURL',  '業態タグ', '最寄駅', '抹茶メニューリスト', '確度', '区', '住所', '営業状態', '備考']
WARDS_15 = {'江東区','台東区','港区','目黒区','品川区','世田谷区','杉並区','新宿区','中野区','豊島区','中央区','渋谷区','千代田区','文京区','墨田区','NYC','LA','Sydney','Melbourne','London','Hong Kong'}
KAKUDO_OK = {'確実','要確認','不明','除外候補'}

def main():
    with MD_PATH.open() as f: lines = f.read().split('\n')
    rows=[]; seen_ids=set(); seen_urls={}; issues=[]
    for ln,line in enumerate(lines,1):
        if not line.startswith('| '): continue
        cells=line.split('|')
        if len(cells) < len(HEADERS)+1 or not cells[1].strip().isdigit(): continue
        vals=[c.strip() for c in cells[1:len(HEADERS)+1]]
        d=dict(zip(HEADERS,vals))
        sid=d['id']
        if sid in seen_ids: issues.append((ln,sid,'DUP_ID',f'重複 id={sid}'))
        seen_ids.add(sid)
        if not d['店名']: issues.append((ln,sid,'MISSING_NAME','店名空欄'))
        if 'maps/place' not in d['GoogleマップURL'] and d['GoogleマップURL'] != '不明':
            issues.append((ln,sid,'BAD_MAPS_URL',f'place URL未設定: "{d["GoogleマップURL"][:60]}"'))
        url=d['GoogleマップURL']
        if 'maps/place' in url:
            key=re.sub(r'\?.*$','',url.split('/data=')[0])
            if key in seen_urls: issues.append((ln,sid,'DUP_MAPS_URL',f'重複URL (id {seen_urls[key]} と)'))
            else: seen_urls[key]=sid
        if d['区'] and d['区'] not in WARDS_15 and d['確度'] != '除外候補':
            issues.append((ln,sid,'OUT_OF_WARDS',f'12区外({d["区"]})なのに除外候補ではない'))
        if d['確度'] and d['確度'] not in KAKUDO_OK:
            issues.append((ln,sid,'BAD_KAKUDO',f'不正な確度値: {d["確度"]}'))
        es=d['営業状態']
        if es and es not in ('営業中','閉店(日付不明)','要確認'):
            if not re.match(r'^\d{4}(-\d{2})?(-\d{2})?$',es) and '閉店' not in es:
                issues.append((ln,sid,'BAD_STATUS',f'営業状態フォーマット不正: {es}'))
        if not d['抹茶メニューリスト']: issues.append((ln,sid,'NO_MENU_LIST','抹茶メニューリスト空欄'))
        if d['食べログURL'] and 'tabelog.com' not in d['食べログURL'] and d['食べログURL'] not in ('不明','食べログ未登録'):
            issues.append((ln,sid,'BAD_TABELOG_URL',d['食べログURL'][:60]))
        if d['InstagramURL'] and not d['InstagramURL'].startswith('http') and d['InstagramURL'] not in ('不明','IGなし'):
            issues.append((ln,sid,'BAD_IG_URL',f'IG URLでない: {d["InstagramURL"][:40]}'))
        rows.append(d)

    print(f'=== matcha_cafes.md 検証結果 (12区23列) ===')
    print(f'総行数: {len(rows)}')
    print(f'問題件数: {len(issues)}')
    by_type={}
    for issue in issues: by_type.setdefault(issue[2],[]).append(issue)
    for t,items in sorted(by_type.items(),key=lambda x:-len(x[1])):
        print(f'\n[{t}] {len(items)}件')
        for ln,sid,_,msg in items[:10]: print(f'  L{ln} id={sid}: {msg}')
        if len(items)>10: print(f'  ... +{len(items)-10}件')

    print(f'\n=== カバレッジ ===')
    for h in HEADERS:
        n=sum(1 for r in rows if r[h] and r[h]!='不明')
        print(f'  {h:<25} {n:>4}/{len(rows)} ({n*100//len(rows)}%)')
    return 1 if issues else 0

if __name__=='__main__': sys.exit(main())
