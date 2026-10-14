import re

with open('research.tex') as f:
    lines = f.readlines()

print(f"Total lines in research.tex: {len(lines)}")

# Check for unescaped underscores
for idx, line in enumerate(lines, 1):
    clean = re.sub(r'(?<!\\)%.*', '', line)
    # Check if inside \label, \ref, \cite, \url, \includegraphics, \begin, \end
    # Remove commands that legitimately contain underscores
    protected = re.sub(r'\\(?:label|ref|pageref|autoref|eqref|cite|url|includegraphics|begin|end)\{[^}]*\}', '', clean)
    protected = re.sub(r'\\begin\{[^}]*\}', '', protected)
    protected = re.sub(r'\\end\{[^}]*\}', '', protected)
    # now check math vs non-math
    parts = protected.split('$')
    for part_idx, part in enumerate(parts):
        if part_idx % 2 == 0: # non-math
            # find underscores not preceded by backslash
            for m in re.finditer(r'(?<!\\)_', part):
                print(f"Line {idx}: Unescaped underscore outside math: {line.strip()}")

# Check for unescaped percent signs
for idx, line in enumerate(lines, 1):
    clean = line
    # find % not preceded by backslash and not start of comment
    # In LaTeX, anything after unescaped % is comment, but if someone wrote "99%" instead of "99\%", it comments out the rest of the line!
    for m in re.finditer(r'\b\d+%', clean):
        print(f"Line {idx}: Unescaped % after digit (likely unintended comment): {clean.strip()}")

# Check for unescaped ampersand outside table
in_table = False
for idx, line in enumerate(lines, 1):
    clean = re.sub(r'(?<!\\)%.*', '', line)
    if any(tag in clean for tag in ['\\begin{tabular', '\\begin{tabularx', '\\begin{array', '\\begin{matrix', '\\begin{bmatrix']):
        in_table = True
    if any(tag in clean for tag in ['\\end{tabular', '\\end{tabularx', '\\end{array', '\\end{matrix', '\\end{bmatrix']):
        in_table = False
    if not in_table:
        # find & not preceded by backslash
        for m in re.finditer(r'(?<!\\)&', clean):
            # except algorithmic or align
            if '\\begin{align' not in clean and '\\begin{aligned' not in clean:
                print(f"Line {idx}: Unescaped & outside table: {clean.strip()}")
