import fs from 'node:fs';

const path = 'src/App.jsx';
let app = fs.readFileSync(path, 'utf8');

const lucideImport = 'import { Shuffle, CheckCircle2, Bot, Sparkles, Zap, Trash2, RotateCcw } from "lucide-react";';
const componentImport = 'import BackgroundRemover from "./components/BackgroundRemover.jsx";';

if (!app.includes(componentImport)) {
  if (!app.includes(lucideImport)) throw new Error('Could not find lucide import anchor');
  app = app.replace(lucideImport, `${lucideImport}\n${componentImport}`);
}

const footerAnchor = `            </div>\n        </div>\n      </main>\n\n      {/* Footer */}`;
const withRemover = `            </div>\n        </div>\n\n        <BackgroundRemover lang={lang} />\n      </main>\n\n      {/* Footer */}`;

if (!app.includes('<BackgroundRemover lang={lang} />')) {
  if (!app.includes(footerAnchor)) throw new Error('Could not find footer insertion anchor');
  app = app.replace(footerAnchor, withRemover);
}

fs.writeFileSync(path, app, 'utf8');
console.log('Background remover mounted in App.jsx');
