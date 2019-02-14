const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  /**
   * Array of plugins contributors
   */
  var contributors = {
    polinaShneider: {
      name: 'PolinaShneider',
      photo: 'https://avatars3.githubusercontent.com/u/15448200?s=40&v=4'
    },
    specc: {
      name: 'neSpecc',
      photo: 'https://avatars0.githubusercontent.com/u/3684889?v=4&s=40'
    },
    n0str: {
      name: 'n0str',
      photo: 'https://avatars1.githubusercontent.com/u/988885?v=4&s=60'
    },
    talyguryn: {
      name: 'talyguryn',
      photo: 'https://avatars1.githubusercontent.com/u/15259299?v=4&s=40'
    },
    khaydarov: {
      name: 'khaydarov',
      photo: 'https://avatars1.githubusercontent.com/u/6507765?s=40&v=4'
    },
    horoyami: {
      name: 'horoyami',
      photo: 'https://avatars2.githubusercontent.com/u/34141926?s=40&v=4'
    },
    gohabereg: {
      name: 'gohabereg',
      photo: 'https://avatars1.githubusercontent.com/u/23050529?s=40&v=4'
    }
  };

  var plugins = [
    {
      name: 'Header',
      type: 'Block',
      description: 'How will you live without headers?',
      demo: '/public/app/landings/editor/demo/header.png',
      url: 'https://github.com/codex-editor/header',
      contributors: [
        contributors['specc'],
        contributors['talyguryn'],
        contributors['n0str']
      ]
    },
    {
      name: 'Simple Image',
      type: 'Block',
      description: 'Allow pasting image by URLs',
      demo: 'https://capella.pics/f67bd749-0115-4ea8-b4b9-4375b20667bc.jpg',
      url: 'https://github.com/codex-editor/simple-image',
      contributors: [
        contributors['specc']
      ]
    },
    {
      name: 'Image',
      type: 'Block',
      description: 'Full featured image Block integrated with your backend',
      demo: '/public/app/landings/editor/demo/image-tool.mp4',
      url: 'https://github.com/codex-editor/image',
      contributors: [
        contributors['specc'],
        contributors['talyguryn']
      ]
    },
    {
      name: 'Embed',
      type: 'Block',
      description: 'Here is YouTube, Vimeo, Imgur, Gfycat, Twitch and other embeds',
      demo: '/public/app/landings/editor/demo/embed.mp4',
      url: 'https://github.com/codex-editor/embed',
      contributors: [
        contributors['gohabereg']
      ]
    },
    {
      name: 'Quote',
      type: 'Block',
      description: 'Include quotes in your articles',
      demo: '/public/app/landings/editor/demo/quote.png',
      url: 'https://github.com/codex-editor/quote',
      contributors: [
        contributors['talyguryn']
      ]
    },
    {
      name: 'Marker',
      type: 'Inline Tool',
      description: 'Highlight text fragments in your beautiful articles',
      demo: '/public/app/landings/editor/demo/marker.gif',
      url: 'https://github.com/codex-editor/marker',
      contributors: [
        contributors['polinaShneider']
      ]
    },
    {
      name: 'Code',
      type: 'Block',
      description: 'Include code examples in your writings',
      demo: 'https://capella.pics/8c48b0e0-4885-452d-9a78-d563d279d08d.jpg',
      url: 'https://github.com/codex-editor/code',
      contributors: [
        contributors['talyguryn'],
        contributors['polinaShneider']
      ]
    },
    {
      name: 'Link',
      type: 'Inline Tool',
      description: 'Embed links in your articles',
      demo: '/public/app/landings/editor/demo/link.gif',
      url: 'https://github.com/codex-editor/link',
      contributors: [
        contributors['specc'],
        contributors['talyguryn'],
        contributors['khaydarov']
      ]
    },
    {
      name: 'List',
      type: 'Block',
      description: 'Add ordered or bullet lists to your article',
      demo: '/public/app/landings/editor/demo/list.png',
      url: 'https://github.com/codex-editor/list',
      contributors: [
        contributors['specc'],
        contributors['talyguryn'],
        contributors['khaydarov']
      ]
    },
    {
      name: 'Delimiter',
      type: 'Block',
      description: 'Separate blocks of text in your articles',
      demo: 'https://capella.pics/825a3f47-ef7e-4c64-bc73-521c9c3faee4.jpg',
      url: 'https://github.com/codex-editor/delimiter',
      contributors: [
        contributors['n0str'],
        contributors['talyguryn'],
        contributors['specc']
      ]
    },
    {
      name: 'Inline Code',
      type: 'Inline Tool',
      description: 'Inline Tool for marking code-fragments',
      demo: '/public/app/landings/editor/demo/inline-code.gif',
      url: 'https://github.com/codex-editor/inline-code',
      contributors: [
        contributors['talyguryn']
      ]
    },
    {
      name: 'HTML',
      type: 'Block',
      description: 'Include raw HTML code in your articles',
      demo: 'https://capella.pics/7cf636b6-dad4-4798-bfa4-5273e6c0250f.jpg',
      url: 'https://github.com/codex-editor/raw',
      contributors: [
        contributors['talyguryn'],
        contributors['polinaShneider']
      ]
    },
    {
      name: 'Warning',
      type: 'Block',
      description: 'Editorial notifications, appeals or warnings',
      demo: 'https://capella.pics/ff210390-4b0b-4655-aaf0-cc4a0414e81b.jpg',
      url: 'https://github.com/codex-editor/warning',
      contributors: [
        contributors['polinaShneider'],
        contributors['specc']
      ]
    },
    {
      name: 'Table',
      type: 'Block',
      description: 'Table constructor that you would enjoy',
      demo: '/public/app/landings/editor/demo/table.mp4',
      url: 'https://github.com/codex-editor/table',
      contributors: [
        contributors['horoyami'],
        contributors['gohabereg']
      ]
    }
  ];

  res.render('index', {
    plugins
  });
});

module.exports = router;
