// Prettier refuses symlinks passed explicitly, so filter out CLAUDE.md
// (a symlink to AGENTS.md) from the formatting task.
const quote = (files) => files.map((f) => JSON.stringify(f)).join(' ');
const notSymlink = (f) => !f.endsWith('CLAUDE.md');

export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,css,md}': (files) => {
    const target = files.filter(notSymlink);
    return target.length ? [`prettier --write ${quote(target)}`] : [];
  },
};
