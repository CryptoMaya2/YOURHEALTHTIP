// Run tests against the actual Python contract source with mocked GenVM I/O.
import { spawnSync } from 'node:child_process';
const result = spawnSync('python3', ['-m', 'unittest', 'discover', '-s', 'contracts', '-v'], {stdio:'inherit'});
process.exit(result.status ?? 1);
