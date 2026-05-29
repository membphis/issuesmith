/**
 * IssueSmith plugin for OpenCode.ai
 *
 * Registers IssueSmith skills, commands, and injects bootstrap context
 * so the agent follows the IssueSmith development workflow.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const skillsDir = path.resolve(projectRoot, 'skills');

const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

let _bootstrapCache = undefined;

const getBootstrapContent = () => {
  if (_bootstrapCache !== undefined) return _bootstrapCache;

  const skillPath = path.join(skillsDir, 'using-issuesmith', 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    _bootstrapCache = null;
    return null;
  }

  const fullContent = fs.readFileSync(skillPath, 'utf8');
  const { content } = extractAndStripFrontmatter(fullContent);

  _bootstrapCache = `<EXTREMELY_IMPORTANT>
You have IssueSmith superpowers.

**IMPORTANT: The using-issuesmith skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-issuesmith" again - that would be redundant.**

${content}
</EXTREMELY_IMPORTANT>`;

  return _bootstrapCache;
};

const readSkillContent = (skillName) => {
  const filePath = path.join(skillsDir, skillName, 'SKILL.md');
  if (!fs.existsSync(filePath)) return null;
  const { content } = extractAndStripFrontmatter(fs.readFileSync(filePath, 'utf8'));
  return content.trim();
};

const COMMAND_MAP = {
  'issuesmith-explore':      'ism:explore',
  'issuesmith-create':       'ism:create',
  'issuesmith-start':        'ism:start',
  'issuesmith-implement':    'ism:implement',
  'issuesmith-finish':       'ism:finish',
  'issuesmith-verify':       'ism:verify',
  'issuesmith-code-review':  'ism:code-review',
};

const COMMAND_DESCRIPTIONS = {
  'ism:explore':  'Enter explore mode to think through ideas before creating an Issue',
  'ism:create':   'Create a well-structured GitHub Issue from your idea',
  'ism:start':    'Start development by creating an isolated git worktree and branch',
  'ism:implement': 'Implement an Issue Task Checklist with IssueSmith discipline',
  'ism:finish':   'Finish the current development branch: verify, PR, review, merge',
  'ism:verify':   'Run verification commands — evidence before claims',
  'ism:code-review': 'Systematic code review across 5 dimensions',
};

export const IssuesmithPlugin = async ({ client, directory }) => {
  return {
    config: async (config) => {
      // Register skills path so OpenCode discovers issuesmith skills
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }

      // Register commands from skills/issuesmith-*/SKILL.md
      config.command = config.command || {};
      for (const [skillName, cmdName] of Object.entries(COMMAND_MAP)) {
        const template = readSkillContent(skillName);
        if (template) {
          config.command[cmdName] = {
            template,
            description: COMMAND_DESCRIPTIONS[cmdName] || template.split('\n')[0],
          };
        }
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('EXTREMELY_IMPORTANT'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};
