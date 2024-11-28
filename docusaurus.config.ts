import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'ModulesPress',
  tagline: 'The Framework for Modular and Declarative WordPress Plugins',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://modulespress.devsroutes.co',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'devsroutes', // Usually your GitHub org/user name.
  projectName: 'modulespress', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          routeBasePath: '/', // Serve the docs 
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'ModulesPress',
      logo: {
        alt: 'ModulesPress Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'html',
          position: 'right',
          value: `
         <a href="https://github.com/devsroutes/modulespress" 
   target="_blank" 
   style="
      display: flex; 
      align-items: center;
      font-weight: 600;
      text-decoration: none; 
      font-size: 16px;">
   <span style="
      display: flex;
    align-items: center;
    justify-content: center;
      width: 30px; 
      height: 30px; 
      background-image: url('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'); 
      background-repeat: no-repeat; 
      background-size: contain; 
      border-radius: 50%;
      margin-right: 4px;">
   </span>
   GitHub
</a>
          `
        },
        // {
        //   href: 'https://github.com/devsroutes/modulespress',
        //   label: 'GitHub',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/getting-started/introduction',
            },
            {
              label: 'Headless CMS',
              to: '/docs/category/wp-rest-api',
            }
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'X',
              href: 'https://x.com/devsroutes',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/jtUn2X3VeH',
            },
            {
              label: 'Github',
              href: 'https://github.com/devsroutes/modulespress',
            }
          ],
        },
        {
          title: 'Creators',
          items: [
            {
              label: 'Dev Routes',
              href: 'https://devsroutes.co',
            },
            {
              label: 'ModulesPress',
              href: 'https://modulespress.devsroutes.co',
            }
          ],
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ModulesPress. Built by Devs Routes.`,
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['powershell', 'php'],
    },
  } satisfies Preset.ThemeConfig,

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid']
};

export default config;
