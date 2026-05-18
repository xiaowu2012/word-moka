#!/usr/bin/env python3
"""Fix phonetic transcriptions for 九年级上册 (Unit1-6) in words.json"""

import json
import re

PHONETIC_FIXES = {
    # === Unit 1 ===
    "lady": "/ˈleɪdi/",
    "gentleman": "/ˈdʒentlmən/",
    "performer": "/pəˈfɔːmə/",
    "finger": "/ˈfɪŋɡə/",
    "teenager": "/ˈtiːneɪdʒə/",
    "unless": "/ʌnˈles/",
    "performance": "/pəˈfɔːməns/",
    "blood": "/blʌd/",
    "perform": "/pəˈfɔːm/",
    "viewer": "/ˈvjuːə/",
    "creativity": "/ˌkriːeɪˈtɪvəti/",
    "artist": "/ˈɑːtɪst/",
    "group": "/ɡruːp/",
    "creator": "/kriːˈeɪtə/",
    "kill": "/kɪl/",
    "youth": "/juːθ/",
    "wealthy": "/ˈwelθi/",
    "hidden": "/ˈhɪdn/",
    "wildly": "/ˈwaɪldli/",
    "scare": "/skeə/",
    "wing": "/wɪŋ/",
    "edge": "/edʒ/",
    "roar": "/rɔː/",
    "claw": "/klɔː/",
    "scaled": "/skeɪld/",
    "dust": "/dʌst/",
    "valley": "/ˈvæli/",
    "vast": "/vɑːst/",
    "tender": "/ˈtendə/",
    "grand": "/ɡrænd/",
    "burst": "/bɜːst/",
    "inspire": "/ɪnˈspaɪə/",
    "intelligent": "/ɪnˈtelɪdʒənt/",
    "educator": "/ˈedʒukeɪtə/",
    "eagle": "/ˈiːɡl/",
    "lie": "/laɪ/",
    "old-fashioned": "/ˌəʊld ˈfæʃnd/",
    "puppet": "/ˈpʌpɪt/",
    "puppetry": "/ˈpʌpɪtri/",
    "scarecrow": "/ˈskeəkrəʊ/",
    "volunteer": "/ˌvɒlənˈtɪə/",

    # === Unit 2 ===
    "account": "/əˈkaʊnt/",
    "cent": "/sent/",
    "certainly": "/ˈsɜːtnli/",
    "chain": "/tʃeɪn/",
    "christmas": "/ˈkrɪsməs/",
    "couple": "/ˈkʌpl/",
    "date": "/deɪt/",
    "dollar": "/ˈdɒlə/",
    "dreamland": "/ˈdriːmlænd/",
    "exactly": "/ɪɡˈzæktli/",
    "exception": "/ɪkˈsepʃn/",
    "expensive": "/ɪkˈspensɪv/",
    "habit": "/ˈhæbɪt/",
    "inference": "/ˈɪnfərəns/",
    "laptop": "/ˈlæptɒp/",
    "manage": "/ˈmænɪdʒ/",
    "organiser": "/ˈɔːɡənaɪzə/",
    "penny": "/ˈpeni/",
    "pleasure": "/ˈpleʒə/",
    "quick": "/kwɪk/",
    "rate": "/reɪt/",
    "sale": "/seɪl/",
    "saving": "/ˈseɪvɪŋ/",
    "size": "/saɪz/",
    "spare": "/speə/",
    "t-shirt": "/ˈtiːʃɜːt/",
    "tin": "/tɪn/",
    "treasure": "/ˈtreʒə/",
    "unlike": "/ʌnˈlaɪk/",
    "value": "/ˈvæljuː/",
    "website": "/ˈwebsaɪt/",

    # === Unit 3 ===
    "amaze": "/əˈmeɪz/",
    "background": "/ˈbækɡraʊnd/",
    "bat": "/bæt/",
    "besides": "/bɪˈsaɪdz/",
    "cartoon": "/kɑːˈtuːn/",
    "central": "/ˈsentrəl/",
    "centre": "/ˈsentə/",
    "detailed": "/ˈdiːteɪld/",
    "fever": "/ˈfiːvə/",
    "fridge": "/frɪdʒ/",
    "kingdom": "/ˈkɪŋdəm/",
    "magnet": "/ˈmæɡnɪt/",
    "matchbox": "/ˈmætʃbɒks/",
    "moai": "/ˈməʊaɪ/",
    "mystery": "/ˈmɪstəri/",
    "northwest": "/ˌnɔːθˈwest/",
    "palace": "/ˈpæləs/",
    "period": "/ˈpɪəriəd/",
    "possibility": "/ˌpɒsəˈbɪləti/",
    "pretty": "/ˈprɪti/",
    "pride": "/praɪd/",
    "remains": "/rɪˈmeɪnz/",
    "researcher": "/rɪˈsɜːtʃə/",
    "sillk": "/sɪlk/",
    "statue": "/ˈstætʃuː/",
    "tomb": "/tuːm/",
    "valuable": "/ˈvæljuəbl/",
    "version": "/ˈvɜːʃn/",

    # === Unit 4 ===
    "battle": "/ˈbætl/",
    "bravely": "/ˈbreɪvli/",
    "buring": "/ˈbɜːnɪŋ/",
    "countless": "/ˈkaʊntləs/",
    "death": "/deθ/",
    "dreamer": "/ˈdriːmə/",
    "entry": "/ˈentri/",
    "fearless": "/ˈfɪələs/",
    "fighter": "/ˈfaɪtə/",
    "fixed": "/fɪkst/",
    "footstep": "/ˈfʊtstep/",
    "gentle": "/ˈdʒentl/",
    "heroic": "/hɪˈrəʊɪk/",
    "northeast": "/ˌnɔːθˈiːst/",
    "pity": "/ˈpɪti/",
    "president": "/ˈprezɪdənt/",
    "productive": "/prəˈdʌktɪv/",
    "recommend": "/ˌrekəˈmend/",
    "republic": "/rɪˈpʌblɪk/",
    "selfless": "/ˈselfləs/",
    "socialist": "/ˈsəʊʃəlɪst/",
    "soil": "/sɔɪl/",
    "temperature": "/ˈtemprətʃə/",
    "type": "/taɪp/",
    "unchanging": "/ʌnˈtʃeɪndʒɪŋ/",

    # === Unit 5 ===
    "admire": "/ədˈmaɪə/",
    "alarm": "/əˈlɑːm/",
    "balance": "/ˈbæləns/",
    "cancel": "/ˈkænsl/",
    "cartoonist": "/kɑːˈtuːnɪst/",
    "control": "/kənˈtrəʊl/",
    "drop": "/drɒp/",
    "ecosystem": "/ˈiːkəʊsɪstəm/",
    "endangered": "/ɪnˈdeɪndʒəd/",
    "environmental": "/ɪnˌvaɪrənˈmentl/",
    "farmland": "/ˈfɑːmlænd/",
    "foreigner": "/ˈfɒrənə/",
    "gas": "/ɡæs/",
    "greenhouse": "/ˈɡriːnhaʊs/",
    "harm": "/hɑːm/",
    "logging": "/ˈlɒɡɪŋ/",
    "logo": "/ˈləʊɡəʊ/",
    "mark": "/mɑːk/",
    "overfishing": "/ˌəʊvəˈfɪʃɪŋ/",
    "permit": "/pəˈmɪt/",
    "population": "/ˌpɒpjuˈleɪʃn/",
    "protection": "/prəˈtekʃn/",
    "punishment": "/ˈpʌnɪʃmənt/",
    "rapid": "/ˈræpɪd/",
    "rubbish": "/ˈrʌbɪʃ/",
    "smog": "/smɒɡ/",
    "society": "/səˈsaɪəti/",
    "till": "/tɪl/",
    "tourist": "/ˈtʊərɪst/",
    "vulnerable": "/ˈvʌlnərəbl/",
    "worldwide": "/ˌwɜːldˈwaɪd/",

    # === Unit 6 ===
    "average": "/ˈævərɪdʒ/",
    "bin": "/bɪn/",
    "business": "/ˈbɪznəs/",
    "businessman": "/ˈbɪznəsmæn/",
    "capital": "/ˈkæpɪtl/",
    "cheap": "/tʃiːp/",
    "coal": "/kəʊl/",
    "depth": "/depθ/",
    "electronic": "/ɪˌlekˈtrɒnɪk/",
    "fog": "/fɒɡ/",
    "formation": "/fɔːˈmeɪʃn/",
    "former": "/ˈfɔːmə/",
    "furthermore": "/ˌfɜːðəˈmɔː/",
    "glove": "/ɡlʌv/",
    "highlight": "/ˈhaɪlaɪt/",
    "industrial": "/ɪnˈdʌstriəl/",
    "industry": "/ˈɪndəstri/",
    "litter": "/ˈlɪtə/",
    "loudly": "/ˈlaʊdli/",
    "negative": "/ˈneɡətɪv/",
    "noisy": "/ˈnɔɪzi/",
    "nowhere": "/ˈnəʊweə/",
    "peace": "/piːs/",
    "plastic-free": "/ˈplæstɪk friː/",
    "pollute": "/pəˈluːt/",
    "recycle": "/ˌriːˈsaɪkl/",
    "reporter": "/rɪˈpɔːtə/",
    "silently": "/ˈsaɪləntli/",
    "tie": "/taɪ/",
    "tiny": "/ˈtaɪni/",
    "toothbrush": "/ˈtuːθbrʌʃ/",
    "truck": "/trʌk/",
    "upcycle": "/ˈʌpsaɪkl/",
    "village": "/ˈvɪlɪdʒ/",
    "weight": "/weɪt/",
    "worst": "/wɜːst/",
}

# Load and apply fixes
with open('words.json', 'r') as f:
    data = json.load(f)

fixed_count = 0
errors = []
for word_key, correct_phonetic in PHONETIC_FIXES.items():
    if word_key in data:
        old = data[word_key].get('phonetic', '')
        data[word_key]['phonetic'] = correct_phonetic
        if old != correct_phonetic:
            fixed_count += 1
            errors.append((word_key, data[word_key].get('word', word_key), old, correct_phonetic))
    else:
        print(f"WARNING: '{word_key}' not found in data!")

with open('words.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"Total fixes applied: {fixed_count}")
print(f"{'='*60}")

# Show all changes grouped by unit
current_unit = None
for key, word, old, new in errors:
    unit = data[key].get('module', '?')
    if unit != current_unit:
        current_unit = unit
        print(f"\n--- {unit} ---")
    print(f"  {word:20s}  {old:25s} → {new}")

# Also update words.js to match
import shutil
shutil.copy('words.json', 'words.js')
print("\n✅ words.js also updated (synced from words.json)")
