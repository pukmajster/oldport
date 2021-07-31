export const tech = {
  react: 'React',
  svelte: 'Svelte',

  'react-router': 'React Router',

  'vanilla-js': 'Vanilla JS',
  js: 'JavaScript',
  ts: 'TypeScript',
  
  scss: 'SCSS',
  mui: 'Material UI',
  carbon: 'Carbon UI',

  node: 'NodeJS',
  express: 'Express',
  nunjucks: 'Nunjucks',
  sequelize: 'Sequelize',
  firebase: 'Firebase'
}

export const projects = {
  skillup: {
    name: 'skillup',
    label: 'SkillUp Mentor',
    short: 'Developer bootcamp landing page',
    frontend: [ 'react', 'ts', 'scss' ]
  },

  vgui: {
    name: 'vgui',
    label: 'VGUI Inspector',
    short: 'Tool for inspecting Valve\'s VGUI elements',
    more: 'Trying to work with Valve\'s proprietary UI system when modding their game Left4Dead, visaulizing layouts was incredibly frustrating, even more so because the are no tools for conveniently previewing layouts either. I took it upon myself to make this little app that not only lets you preview the UI, but also modify it and see changes on the fly. Later on I also added some (very) rough support for inspecting Respawn Entertainments\'s own version of VGUI used in TitanFall and Apex Legends.',
    frontend: [ 'svelte', 'ts', 'carbon', 'scss' ]
  },

  slocraft: {
    name: 'slocraft',
    label: 'Slocraft',
    short: 'Slovenian Minecraft server landing page',
    more: `I was approached by some friends to make a landing page for their Minecraft server, and I was happy to help.`,
    frontend: [ 'svelte', 'ts', 'scss' ]
  },

  glasbena: {
    name: 'glasbena',
    label: 'Dan Opdrtih Vrat',
    short: 'Event page for music school',
    more: 'A video-oriented site that guides the viewer through various instruments',
    frontend: [ 'react', 'ts', 'scss' ]
  },

  evpis: {
    name: 'evpis',
    label: 'ŠCV eVpis',
    short: 'High school sign up form',
    more: 'Sign up form for students for the entire high school of Velenje, also featuring an admin dashboard.',
    frontend: [ 'react', 'ts', 'mui' ],
    backend: [ 'firebase' ]
  },

  bunker: {
    name: 'bunker',
    label: 'Bunker',
    short: 'Browser startpage',
    more: 'Custom browser startpage I made in my spare time. I was inspired by other startpages I discovered on reddit (r/startpages), so I made my own!',
    frontend: [ 'vanilla-js', 'scss' ]
  },

  pud: {
    name: 'pud',
    label: 'PUD',
    short: 'High school document solution',
    more: 'The digital solution to my school\'s problem of physical documents. Allows students to upload various documents that the school can then easily view and provide feedback directly to the student in a quick and easy manner. Not only was this my first big project, it was also my first time using the React library, along with it being my first project in the freelancing world. While the first versions of this product suffered from my inexperience, I learned a lot about modern web development from this one project alone, not just on the frontend, but on the backend aswell.',
    frontend: [ 'react', 'react-router', 'js', 'mui', 'scss' ],
    backend: [ 'node', 'express', 'ts', 'sequelize' ]
  },

  lanparty: {
    name: 'lanparty',
    label: 'ERŠ Lan Party',
    short: 'High school lan party landing page',
    more: 'A very simple site that was used as the landing page for my high school\'s annual LAN Party event in 2020 and 2021.',
    frontend: [ 'vanilla-js', 'scss' ],
    backend: [ 'node', 'express', 'nunjucks' ]
  },
}