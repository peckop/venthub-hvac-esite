
import fs from 'fs'
import path from 'path'

// Parse all .env values
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
const envLines = envContent.split('\n').filter(l => l.trim() && !l.startsWith('#'))

console.log('=== Available ENV Variables ===')
for (const line of envLines) {
    const [key] = line.split('=')
    if (key) {
        // Only show key names, not values (for security)
        console.log(`  - ${key.trim()}`)
    }
}
