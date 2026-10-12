// LiuOS settings: colors, fonts, window sizes, the lock-screen puzzle, apps, and wording.
// Facts about Nathan come from the shared content file.
import { profile, projects, experience } from '../content/portfolio.js';

export const LIUOS_CONFIG={
 colors:{accent:'#332c21',text:'#332c21',muted:'#655e52',base:'#f5f1e8',paperEdge:'#ded7ca',tint:'#b4a68b24',border:'#aaa091',shadow:'#4a3f2e22',bezel:'#332c21',backdrop:'#332c2166',field:'#f5f1e8',camera:'#655e52'},
 typography:{small:12,body:14,title:16,section:22,large:28,bodyLineHeight:1.5},
 font:'Georgia,"Times New Roman",serif',labelFont:'Inter,"Segoe UI",sans-serif',blur:0,radius:0,transitionMs:300,
 dock:{launchMs:700}, // dock icon bounce before an app's window opens (macOS style)
 puzzle:{answers:['python'],hint:'Named after a comedy group; also a kind of snake.',celebrationMs:380,successMs:1200},
 apps:[{id:'projects',title:'Projects',icon:'folder'},{id:'experience',title:'Experience',icon:'briefcase'},{id:'terminal',title:'Terminal',icon:'terminal'},{id:'resume',title:'Resume',icon:'document'},{id:'about',title:'About me',icon:'person'},{id:'contact',title:'Contact',icon:'mail'},{id:'guide',title:'AI guide',icon:'spark'}],
 profile:{...profile,avatarSelector:"#signin-panel .avatar img",aboutHeading:"About Nathan"},
 projects,
 experience,
 content:{
  "copyEmailLabel":"Copy", "copiedEmailLabel":"Copied", "copyFailedLabel":"Try again",
  "contactHeading": "Let’s connect",
  "contactIntro": "Happy to chat about tech, internships, or whatever you're building.",
  "contactLabels": [
    [
      "email",
      "Email"
    ],
    [
      "linkedin",
      "LinkedIn"
    ],
    [
      "github",
      "GitHub"
    ]
  ],
  "projectsHeading": "Projects",
  "projectsBreadcrumb": "Workspace / Projects",
  "descriptionHeading": "About the project",
  "roleHeading": "My role",
  "experienceHeading": "Experience",
  "experienceIntro": "Work and contributions, newest first.",
  "guideHeading": "AI guide",
  "guideIntro": "An assistant for questions about my work, interests, and experience.",
  "guideTodo": "TODO · connect the AI backend and approved source material",
  "guideNote": "The guide is not connected yet. It will answer from material I choose to share and cite supporting projects and facts.",
  "guidePrompt": "Ask about Nathan…"
},
 terminal:{
  "historyLimit": 100,
  "greeting": "LiuOS terminal · type help to explore.",
  "passwordNote": "Favorite language? That's the lock screen password. No hints here.",
  "help": "help · whoami · experience · projects · ls projects · open hottakes · open marginguard · open website · open <project-id> · cat resume · contact · clear",
  "resumeMessage": "Opening the original resume PDF.",
  "notFound": "Project not found. Use projects for available IDs.",
  "unknown": "Unknown command. Type help.",
  "openingPrefix": "Opening "
},
 resumeViewer:{windowWidth:530,pageMaxWidth:620,zoomStep:.25,minZoom:.75,maxZoom:2},
 windows:{contactWidth:560,contactHeight:380,widthRatio:.65,heightRatio:.7,minWidth:260,maxWidth:720,minHeight:200,maxHeight:420,cascade:28,animationMs:180,mobileBreakpoint:600},
 screen:{resolution:2048,aspect:12.8/6.7,glareOpacity:.055,vignetteOpacity:.08,wallpaperFps:15,animatedWallpaper:false,brightness:.94,hoverBrightness:1,calloutGap:24},
 wallpaper:{speed:2,resolution:1,maxFps:30,cursorStrength:.035,cursorDamping:4,pixelRatioCap:2,module:'./wallpaper.js'},clock:{refreshMs:30000}
};
