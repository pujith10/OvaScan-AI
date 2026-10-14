import re

with open('research.tex') as f:
    text = f.read()
    lines = text.splitlines()

# 1. Check matched environments
env_stack = []
for idx, line in enumerate(lines, 1):
    # remove comments
    clean_line = ""
    i = 0
    while i < len(line):
        if line[i] == '%' and (i == 0 or line[i-1] != '\\'):
            break
        clean_line += line[i]
        i += 1
    
    begins = re.findall(r'\\begin\{([^}]+)\}', clean_line)
    ends = re.findall(r'\\end\{([^}]+)\}', clean_line)
    for b in begins:
        env_stack.append((b, idx))
    for e in ends:
        if not env_stack:
            print(f"Unmatched \\end{{{e}}} at line {idx}")
        else:
            top, top_idx = env_stack.pop()
            if top != e:
                print(f"Mismatched env: \\begin{{{top}}} at {top_idx} vs \\end{{{e}}} at line {idx}")

if env_stack:
    for b, idx in env_stack:
        print(f"Unclosed \\begin{{{b}}} at line {idx}")
else:
    print("All environments matched perfectly!")

# 2. Check labels and refs
labels = set(re.findall(r'\\label\{([^}]+)\}', text))
refs = set()
for m in re.findall(r'\\(?:ref|pageref|autoref|eqref)\{([^}]+)\}', text):
    refs.add(m)

print(f"\nTotal labels: {len(labels)}, Total unique refs: {len(refs)}")
missing_labels = refs - labels
if missing_labels:
    print("Referenced but not defined labels:", missing_labels)
else:
    print("All refs have matching labels!")

# 3. Check citations
with open('references.bib') as f:
    bib = f.read()
bib_keys = set(re.findall(r'@\w+\{([^,]+),', bib))

cites = set()
for match in re.findall(r'\\cite\{([^}]+)\}', text):
    for key in match.split(','):
        cites.add(key.strip())

print(f"\nTotal bib keys: {len(bib_keys)}, Total unique citations: {len(cites)}")
missing_cites = cites - bib_keys
if missing_cites:
    print("Missing citation keys not in references.bib:", missing_cites)
else:
    print("All citations exist in references.bib!")

unused_cites = bib_keys - cites
print("Bib keys not cited in tex:", unused_cites)

# 4. Check for double punctuation or common latex typos
typos = [
    (r'\s,', "Space before comma"),
    (r'\s\.', "Space before period"),
    (r'\b(the\s+the|in\s+in|of\s+of|and\s+and|to\s+to|a\s+a)\b', "Duplicate words"),
    (r'\\cite\{[^}]*,\s*\}', "Trailing comma in cite"),
    (r'\\ref\{\}', "Empty ref"),
]

for pat, desc in typos:
    matches = list(re.finditer(pat, text, re.IGNORECASE))
    if matches:
        print(f"\nPotential issue: {desc} ({len(matches)} matches)")
        for m in matches[:5]:
            # find line number
            lineno = text[:m.start()].count('\n') + 1
            print(f"  Line {lineno}: {m.group(0)}")
