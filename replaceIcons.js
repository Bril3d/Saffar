const fs = require('fs');
const path = require('path');
const dirs = ['c:/Users/n3tgg/OneDrive/Desktop/New folder/Hackathon/app', 'c:/Users/n3tgg/OneDrive/Desktop/New folder/Hackathon/components'];

function walk(d) {
  let results = [];
  if (!fs.existsSync(d)) return results;
  const list = fs.readdirSync(d);
  list.forEach(file => {
    file = path.join(d, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const getIconForLabel = (label) => {
  if (/Accueil/i.test(label)) return 'Home';
  if (/Profil/i.test(label)) return 'User';
  if (/Ventes/i.test(label)) return 'ShoppingCart';
  if (/Alertes/i.test(label)) return 'Bell';
  if (/Rx|Prescriptions/i.test(label)) return 'ClipboardList';
  if (/Mes Lots/i.test(label)) return 'Package';
  if (/IA|Assistant/i.test(label)) return 'Bot';
  if (/Historique/i.test(label)) return 'History';
  if (/Scanner/i.test(label)) return 'ScanLine';
  if (/Abattoir/i.test(label)) return 'Factory';
  if (/Vétérinaire/i.test(label)) return 'Stethoscope';
  if (/Pharmacien/i.test(label)) return 'Pill';
  if (/Eleveur/i.test(label)) return 'Tractor';
  return 'FileText';
};

const mapExactClasses = {
  'headerIcon': 'Stethoscope', // Will use fallback or specific later if needed
  'successIcon': 'CheckCircle2',
  'aiAvatar': 'Bot',
  'aiHintIcon': 'Bot',
  'submitIcon': 'CheckCircle2',
  'notifIcon': 'Bell',
  'emptyIcon': 'Package',
  'blockchainIcon': 'Link',
};

const iconImportSet = new Set();

let changedFiles = 0;
dirs.forEach(dir => {
  const files = walk(dir);
  files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let hasChanges = false;
    let localImports = new Set();

    // Map specific tabs (with labels)
    content = content.replace(/(<Text style=\{[^}]+\}><\/Text>)\s*(<Text style=\{[^}]+\}>)(.*?)(<\/Text>)/g, (match, iconNode, labelStart, labelText, labelEnd) => {
      hasChanges = true;
      const iconName = getIconForLabel(labelText);
      localImports.add(iconName);
      // Determine if active
      const isActive = match.includes('Active');
      return `<${iconName} size={24} color={${isActive ? 'Colors.primary' : 'Colors.onSurfaceVariant'}} />${labelStart}${labelText}${labelEnd}`;
    });

    // Map specific isolated icons by style name
    content = content.replace(/<Text style=\{([^}]+)\}>\s*<\/Text>/g, (match, styleContent) => {
      for (const [key, iconName] of Object.entries(mapExactClasses)) {
        if (styleContent.includes(key)) {
          hasChanges = true;
          localImports.add(iconName);
          let size = 24;
          if (styleContent.includes('headerIcon') || styleContent.includes('successIcon') || styleContent.includes('emptyIcon')) size = 32;
          return `<${iconName} size={${size}} color={Colors.primary} />`;
        }
      }
      return match;
    });

    // Handle generic cases where we replaced `<Text style={{ fontSize: 24 }}></Text>` directly
    content = content.replace(/<Text style=\{\{\s*fontSize:\s*(\d+)\s*\}\}>\s*<\/Text>\s*(<Text[^>]*>)(.*?)(<\/Text>)/g, (match, size, labelStart, labelText, labelEnd) => {
      hasChanges = true;
      const iconName = getIconForLabel(labelText);
      localImports.add(iconName);
      return `<${iconName} size={${size}} color={Colors.primary} />${labelStart}${labelText}${labelEnd}`;
    });
    
    // Remaining generic naked `<Text style={{ fontSize: 18 }}></Text>` (like in new-sale.tsx)
    content = content.replace(/<Text style=\{\{\s*fontSize:\s*(\d+)\s*\}\}>\s*<\/Text>/g, (match, size) => {
       hasChanges = true;
       localImports.add('CheckCircle2');
       return `<CheckCircle2 size={${size}} color={Colors.onPrimary} />`;
    });

    if (hasChanges && localImports.size > 0) {
      changedFiles++;
      const importStr = `import { ${Array.from(localImports).join(', ')} } from 'lucide-react-native';\n`;
      
      // insert import after the last import
      if (!content.includes('lucide-react-native')) {
        const lines = content.split('\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) lastImportIdx = i;
        }
        if (lastImportIdx !== -1) {
          lines.splice(lastImportIdx + 1, 0, importStr);
          content = lines.join('\n');
        } else {
          content = importStr + content;
        }
      }
      fs.writeFileSync(f, content, 'utf8');
      console.log('Updated: ' + f);
    }
  });
});
console.log('Updated ' + changedFiles + ' files.');
