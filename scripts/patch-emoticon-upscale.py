from pathlib import Path

p = Path('src/components/EmoticonPostProcessor.jsx')
s = p.read_text(encoding='utf-8')

old_import = "import React, { useEffect, useMemo, useState } from 'react';"
new_import = "import React, { useEffect, useMemo, useRef, useState } from 'react';"
if old_import not in s:
    raise SystemExit('React import anchor not found')
s = s.replace(old_import, new_import, 1)

state_anchor = "  const [outputScale, setOutputScale] = useState(1);"
if state_anchor not in s:
    raise SystemExit('Output scale state anchor not found')
s = s.replace(state_anchor, state_anchor + "\n  const processedRef = useRef([]);", 1)

old_cleanup = """  useEffect(() => () => {
    processed.forEach((item) => item.finalUrl && URL.revokeObjectURL(item.finalUrl));
  }, [processed]);"""
new_cleanup = """  useEffect(() => {
    processedRef.current = processed;
  }, [processed]);

  useEffect(() => () => {
    processedRef.current.forEach((item) => item.finalUrl && URL.revokeObjectURL(item.finalUrl));
  }, []);"""
if old_cleanup not in s:
    raise SystemExit('Processed URL cleanup anchor not found')
s = s.replace(old_cleanup, new_cleanup, 1)

p.write_text(s, encoding='utf-8')
print('Fixed processed preview URL cleanup')
