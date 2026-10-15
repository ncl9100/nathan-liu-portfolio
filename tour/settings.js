// Tour settings: the stops and what the card says at each one.
// "view" is a room camera stop (the same names room:go takes). On touch screens "Click" reads
// "Tap", and "touchText", if given, replaces the whole line.
export const TOUR_CONFIG = {
  steps: [
    { view: 'angle', text: 'Welcome to my room. Here’s a 30-second tour.' },
    { view: 'details', text: 'The paper on my desk is my resume. Click it to read it up close.' },
    { view: 'desk', text: 'My laptop runs LiuOS. Open it to see my projects and experience.' },
    { view: 'seated', label: 'Easter eggs', text: 'Outside of work: photos with friends and family. Click one to look closer.' },
    { view: 'angle', text: 'That’s it. Drag to turn, scroll to zoom, and click anything.', touchText: 'That’s it. Swipe to move, pinch to zoom, and tap anything.' }
  ]
};
