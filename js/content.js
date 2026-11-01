// Site content. Edit this file to add units, sections, videos and printables.
// Slide decks are listed by id in decks.js (built from the PowerPoints).
// Practice sets name generators in practice.js.

window.SITE = {
  title: "Mr. Jantz's Physics",
  tagline: "Notes, videos, practice and simulations for Honors and General Physics",
};

// The year's units, from the year plan. Only units with `items` are live.
const YEAR = [
  { num: 0, title: "Course Launch", sub: "Measurement, graphing, significant figures" },
  { num: 1, title: "1D Kinematics", eq: "How can we describe and predict where a moving object will be?" },
  { num: 2, title: "Vectors and Projectile Motion", eq: "How do we predict where a projectile will land?" },
  { num: 3, title: "Forces and Newton's Laws", eq: "Why do objects change their motion?" },
  { num: 4, title: "Circular Motion, Orbits, and Gravity", eq: "What keeps satellites and planets in orbit?" },
  { num: 5, title: "Torque and Rotational Dynamics", eq: "What makes objects rotate or stay balanced?" },
  { num: 6, title: "Momentum", eq: "How can we make collisions safer?" },
  { num: 7, title: "Energy and Work", eq: "Where does energy go when things move and change?" },
  { num: 8, title: "Electric Fields and Forces", eq: "How do charged objects interact without touching?" },
  { num: 9, title: "Electric Circuits", eq: "How do we control the flow of energy with electricity?" },
];

const V = {
  bullet: { id: "tF_zv3TCT1U", title: "Bullet Fired vs. Bullet Dropped", by: "MythBusters" },
  orienteering: { id: "H3TLmTNOb5E", title: "Running Wild: Orienteering", by: "YouTube" },
  drone: { id: "BnI8x9Eum7U", title: "The Drone That Delivers to Your Backyard in Minutes", by: "YouTube" },
  truck: { id: "ZH7GpYJoptU", title: "Vector Vengeance: a ball fired backward off a moving truck", by: "MythBusters" },
  crosswind: { id: "xqKlXYsPfbE", title: "Plane Lands Sideways in Extreme Crosswind", by: "YouTube" },
  cart: { id: "MJ65_E6RqqA", title: "Where does a ball shot from a moving cart land?", by: "YouTube" },
  cliff: { id: "WDilzmazkEE", title: "Slow Motion Cliff Diving, Inis Mór", by: "Red Bull Cliff Diving" },
  longjump: { id: "T0WfsAwvTSU", title: "Mike Powell, World Long Jump Record 1991", by: "YouTube" },
  monkey: { id: "JkI1DnYGWuI", title: "The Hunter and the Monkey", by: "UMD Physics" },
  trebuchet: { id: "euIeHj2-D18", title: "Delaware trebuchet team shoots for a world record", by: "Delaware Online" },
};

const SIM = {
  vector: { file: "sims/vector-lab.html", title: "Vector Lab", blurb: "Draw, add and resolve vectors. Tip-to-tail, components and resultants." },
  relvel: { file: "sims/relative-velocity-lab.html", title: "Relative Velocity Lab", blurb: "Steer a boat across a river and fly a plane in a crosswind." },
  projectile: { file: "sims/projectile-lab.html", title: "Projectile Lab", blurb: "Launch at any speed, angle and height, then take on the target challenges." },
};

// Printables: `file` is relative to files/.
const P = {
  hWorkbook: { file: "honors/Unit2_Student_Workbook.pdf", title: "Unit 2 Student Workbook", note: "Every section's practice problems" },
  hReview23: { file: "honors/Quiz_Review_Sections_2.1-2.3.pdf", title: "Quiz Review: Sections 2.1–2.3" },
  hHoriz: { file: "honors/Practice_Horizontal_Launches.pdf", title: "Horizontal Launch Practice", note: "Blank x and y tables" },
  hBridge: { file: "honors/Horizontal_Projectiles_Bridge_Lab.pdf", title: "Horizontal Projectiles Bridge Lab" },
  hRelVel: { file: "honors/Relative_Velocity_Investigation.pdf", title: "Relative Velocity Investigation", note: "Use with the Relative Velocity Lab" },
  hReviewWs: { file: "honors/Unit2_Review_Workshop.pdf", title: "Review Workshop Packet" },
  hProject: { file: "honors/Projectile_Motion_Project_Honors.pdf", title: "Projectile Launch Project" },
  hPlanning: { file: "honors/Unit2_Project_Planning.pdf", title: "Project Planning Pages" },
  gWorkbook: { file: "general/General_Unit2_Student_Workbook.pdf", title: "Unit 2 Student Workbook", note: "Every section's practice problems" },
  gEqSheet: { file: "general/General_Unit2_Equation_Sheet.pdf", title: "Unit 2 Equation Sheet" },
  gReview23: { file: "general/General_Quiz_Review_Sections_2.1-2.3.pdf", title: "Quiz Review: Sections 2.1–2.3" },
  gHoriz: { file: "general/General_Practice_Horizontal_Launches.pdf", title: "Horizontal Launch Practice", note: "Blank x and y tables" },
  gBridge: { file: "general/General_Horizontal_Projectiles_Bridge_Lab.pdf", title: "Horizontal Projectiles Bridge Lab" },
  gCatchUp: { file: "general/General_Unit2_Catch-Up_Guide_Sections_2.1-2.5.pdf", title: "Catch-Up Guide: Sections 2.1–2.5", note: "Missed class? Start here" },
  gExtension: { file: "general/General_Unit2_Honors_Extension_Packet.pdf", title: "Challenge Packet", note: "Extra problems that go further" },
};

// kind: "section" (a lesson), or "event" (quiz, lab, review, test, project).
// practice: list of generator ids from practice.js.
window.CLASSES = [
  {
    id: "honors",
    name: "Honors Physics",
    blurb: "AP Physics 1 style: derivations, conceptual reasoning and lab design.",
    units: YEAR.map(u => ({ ...u })),
  },
  {
    id: "general",
    name: "General Physics",
    blurb: "Core physics with Desmos as a tool for solving.",
    units: YEAR.map(u => ({ ...u })),
  },
];

CLASSES[0].units[2].items = [
  { kind: "section", sec: "2.1", title: "Scalars and Vectors", deck: "h01", videos: [V.bullet],
    sims: [SIM.vector], practice: ["scalarVector"],
    summary: "A scalar has only a size. A vector has a size and a direction. Why a dropped ball and a launched ball land together." },
  { kind: "section", sec: "2.2", title: "Drawing and Adding Vectors", deck: "h02", videos: [V.orienteering],
    sims: [SIM.vector], practice: ["perpWalk"],
    summary: "Draw vectors to scale, add them tip-to-tail, and find the resultant of two perpendicular vectors." },
  { kind: "section", sec: "2.3", title: "Resolving Vectors into Components", deck: "h03",
    sims: [SIM.vector], practice: ["components", "fromComponents"],
    summary: "Use SOH-CAH-TOA to split a vector into x and y parts, and put parts back together." },
  { kind: "event", id: "quiz-2-1", title: "Quiz: Sections 2.1–2.3", printables: [P.hReview23],
    practice: ["scalarVector", "perpWalk", "components", "fromComponents"],
    summary: "Full-period quiz on scalars and vectors, adding vectors and components." },
  { kind: "section", sec: "2.4", title: "Adding Vectors with Components", deck: "h04", videos: [V.drone],
    sims: [SIM.vector], practice: ["addComponents"],
    summary: "Add vectors that aren't perpendicular by adding their x and y components." },
  { kind: "section", sec: "2.5", title: "Relative Velocity: Boats and Rivers", deck: "h05", videos: [V.truck],
    sims: [SIM.relvel], printables: [P.hRelVel], practice: ["relVelPerp"],
    summary: "Velocity depends on who's watching. Add a boat's velocity and a river's velocity." },
  { kind: "section", sec: "2.6", title: "Relative Velocity with Angles", deck: "h06", videos: [V.crosswind],
    sims: [SIM.relvel], printables: [P.hRelVel], practice: ["relVelAngle"],
    summary: "Aim upstream to land directly across. Fly a heading that cancels a crosswind." },
  { kind: "event", id: "quiz-2-4", title: "Quiz: Sections 2.4–2.6",
    practice: ["addComponents", "relVelPerp", "relVelAngle"],
    summary: "Full-period quiz on adding vectors with components and relative velocity." },
  { kind: "event", id: "bridge-lab", title: "Horizontal Projectiles Bridge Lab", printables: [P.hBridge],
    sims: [SIM.projectile],
    summary: "Ping-pong balls off the bridge: does horizontal speed change the fall time?" },
  { kind: "section", sec: "2.7–2.8", title: "Horizontal Launches", deck: "h07", videos: [V.cart],
    sims: [SIM.projectile], printables: [P.hHoriz], practice: ["horizLaunch", "horizBackward"],
    summary: "Split a launch into an x-world and a y-world, then solve with the four-step routine: set up, map the route, follow it, check." },
  { kind: "section", sec: "2.9", title: "Velocity During Flight", deck: "h09", videos: [V.cliff],
    sims: [SIM.projectile], practice: ["velFlight"],
    summary: "Find the velocity components, speed and direction at any moment, including at impact." },
  { kind: "section", sec: "2.10–2.12", title: "Angled Launches", deck: "h10", videos: [V.longjump, V.monkey],
    sims: [SIM.projectile], practice: ["angledLevel", "cliffAngled", "workBackward"],
    summary: "Launches at an angle on level ground and from a height. Find t with the quadratic formula or with Desmos, and work backward to a launch speed." },
  { kind: "event", id: "review", title: "Review and Reassessment Workshop", deck: "h13", printables: [P.hReviewWs],
    practice: ["perpWalk", "addComponents", "relVelAngle", "horizLaunch", "velFlight", "angledLevel", "cliffAngled", "workBackward"],
    summary: "Targeted practice before the unit test." },
  { kind: "event", id: "test", title: "Unit Test",
    practice: ["addComponents", "relVelAngle", "horizLaunch", "velFlight", "angledLevel", "cliffAngled", "workBackward"],
    summary: "Mixed practice for the unit test." },
  { kind: "event", id: "project", title: "Projectile Launch Project", deck: "h14", videos: [V.trebuchet],
    sims: [SIM.projectile], printables: [P.hProject, P.hPlanning], practice: ["workBackward", "cliffAngled"],
    summary: "Find your launcher's speed with only a meter stick, then hit a target from the balcony." },
];
CLASSES[0].units[2].printables = [P.hWorkbook];

CLASSES[1].units[2].items = [
  { kind: "section", sec: "2.1", title: "Scalars and Vectors", deck: "g01", videos: [V.bullet],
    sims: [SIM.vector], printables: [P.gCatchUp], practice: ["scalarVector"],
    summary: "A scalar has only a size. A vector has a size and a direction." },
  { kind: "section", sec: "2.2", title: "Drawing and Adding Vectors", deck: "g02", videos: [V.orienteering],
    sims: [SIM.vector], printables: [P.gCatchUp], practice: ["perpWalk"],
    summary: "Draw vectors to scale, add them tip-to-tail, and find the resultant of two perpendicular vectors." },
  { kind: "section", sec: "2.3", title: "Resolving Vectors into Components", deck: "g03",
    sims: [SIM.vector], printables: [P.gCatchUp], practice: ["components"],
    summary: "Use SOH-CAH-TOA to split a vector into x and y parts." },
  { kind: "event", id: "quiz-2-1", title: "Quiz: Sections 2.1–2.3", printables: [P.gReview23],
    practice: ["scalarVector", "perpWalk", "components"],
    summary: "Full-period quiz on scalars and vectors, adding vectors and components." },
  { kind: "section", sec: "2.4", title: "Resultants from Components", deck: "g04", videos: [V.drone],
    sims: [SIM.vector], printables: [P.gCatchUp], practice: ["multiLeg", "fromComponents"],
    summary: "Add up the east-west and north-south parts, then find the resultant's size and direction." },
  { kind: "section", sec: "2.5", title: "Relative Velocity: Boats and Rivers", deck: "g05", videos: [V.truck],
    sims: [SIM.relvel], printables: [P.gCatchUp], practice: ["relVelPerp"],
    summary: "Velocity depends on who's watching. Add a boat's velocity and a river's velocity." },
  { kind: "event", id: "quiz-2-4", title: "Quiz: Sections 2.4–2.5",
    practice: ["multiLeg", "fromComponents", "relVelPerp"],
    summary: "Full-period quiz on resultants from components and relative velocity." },
  { kind: "event", id: "bridge-lab", title: "Horizontal Projectiles Bridge Lab", printables: [P.gBridge],
    sims: [SIM.projectile],
    summary: "Ping-pong balls off the bridge: does horizontal speed change the fall time?" },
  { kind: "section", sec: "2.6", title: "Horizontal Launches: x and y Columns", deck: "g06", videos: [V.cart],
    sims: [SIM.projectile], practice: ["horizLaunch"],
    summary: "Split the motion into an x column and a y column linked by time." },
  { kind: "section", sec: "2.7", title: "Horizontal Launch Practice", deck: "g07",
    sims: [SIM.projectile], printables: [P.gHoriz], practice: ["horizLaunch", "horizBackward"],
    summary: "More horizontal launches, including working from where it lands." },
  { kind: "section", sec: "2.8", title: "Velocity During Flight", deck: "g08", videos: [V.cliff],
    sims: [SIM.projectile], practice: ["velFlightGeneral"],
    summary: "The horizontal velocity stays the same. The vertical velocity changes by 9.8 m/s every second." },
  { kind: "section", sec: "2.9", title: "Marble off the Table Lab", deck: "g09",
    sims: [SIM.projectile], practice: ["horizLaunch"],
    summary: "Predict where a marble will land, then test it." },
  { kind: "section", sec: "2.10", title: "Angled Launches: Split and Symmetry", deck: "g10",
    sims: [SIM.projectile], practice: ["angledSplit"],
    summary: "Split the launch velocity into parts. The way up mirrors the way down." },
  { kind: "section", sec: "2.11", title: "Level Ground Launches with Desmos", deck: "g11", videos: [V.longjump],
    sims: [SIM.projectile], practice: ["angledLevel"],
    summary: "Time of flight, maximum height and range, with Desmos to check." },
  { kind: "event", id: "review", title: "Unit 2 Review", deck: "g12", printables: [P.gExtension],
    practice: ["perpWalk", "multiLeg", "relVelPerp", "horizLaunch", "velFlightGeneral", "angledLevel"],
    summary: "Practice everything before the unit test." },
  { kind: "event", id: "test", title: "Unit Test",
    practice: ["perpWalk", "components", "relVelPerp", "horizLaunch", "velFlightGeneral", "angledLevel"],
    summary: "Mixed practice for the unit test." },
  { kind: "event", id: "project", title: "Projectile Launch Project", deck: "g13", videos: [V.trebuchet],
    sims: [SIM.projectile], practice: ["horizBackward", "angledLevel"],
    summary: "Measure your launcher's speed, then predict and hit a target." },
];
CLASSES[1].units[2].printables = [P.gWorkbook, P.gEqSheet, P.gCatchUp, P.gExtension];

// Announcements shown in the side column of each class page. Newest first; leave empty to hide the box.
// Example: { text: "Quiz on Sections 2.4–2.6 next Tuesday.", isNew: true }
SITE.announcements = { honors: [], general: [] };

// Everyday links in the side column.
SITE.everyday = {
  honors: [P.hWorkbook, { url: "https://www.desmos.com/calculator", title: "Desmos calculator" }],
  general: [P.gWorkbook, P.gEqSheet, { url: "https://www.desmos.com/calculator", title: "Desmos calculator" }],
};

// Workbook problems by section, from the workbook's problem marks:
// C = ● Core, P = ○ More practice, X = ★ Challenge.
SITE.workbook = {
  honors: {"2.1": {"C": [1, 2, 3, 5], "P": [4], "X": []}, "2.2": {"C": [1, 2, 4, 9], "P": [3, 5, 6, 7], "X": [8]}, "2.3": {"C": [1, 2, 4, 9, 10, 11], "P": [3, 5, 6, 7], "X": [8]}, "2.4": {"C": [1, 2, 8, 9, 10], "P": [3, 4, 5, 6], "X": [7]}, "2.5": {"C": [1, 2, 6, 7, 8], "P": [3, 4, 5], "X": []}, "2.6": {"C": [1, 2, 3, 5, 7, 9], "P": [4, 6, 8], "X": []}, "2.7": {"C": [1, 2, 3, 4, 7, 12], "P": [5, 8, 9, 10, 11], "X": [6]}, "2.8": {"C": [1, 2, 4, 8, 9, 10], "P": [3, 5, 6, 7, 11, 12, 13], "X": [14, 15]}, "2.9": {"C": [1, 3, 7, 12, 13, 14], "P": [2, 4, 5, 6, 8, 9, 10, 11], "X": []}, "2.10": {"C": [1, 2, 5, 7, 8, 9], "P": [3, 4, 6], "X": []}, "2.11": {"C": [1, 2, 4, 5, 7], "P": [3, 8, 9], "X": [6]}, "2.12": {"C": [1, 2, 3, 7, 8, 9], "P": [4, 5], "X": [6]}},
  general: {"2.1": {"C": [1, 2, 3, 5, 9, 12], "P": [4, 6, 7, 8, 10], "X": [11]}, "2.2": {"C": [1, 2, 3, 4, 9], "P": [5, 6, 7], "X": [8]}, "2.3": {"C": [1, 2, 3, 5, 7, 12], "P": [4, 6, 8, 9, 10], "X": [11]}, "2.4": {"C": [1, 2, 4, 8, 10], "P": [3, 5, 6, 7], "X": [9]}, "2.5": {"C": [1, 2, 3, 4, 5, 10], "P": [6, 7, 8], "X": [9]}, "2.6": {"C": [1, 2, 5, 6, 7, 11], "P": [3, 4, 8, 9], "X": [10]}, "2.7": {"C": [1, 2, 3, 4, 5, 11], "P": [6, 7, 8, 9], "X": [10]}, "2.8": {"C": [1, 2, 4, 6, 7, 9], "P": [3, 5], "X": [8]}, "2.9": {"C": [1, 2, 3, 4, 5, 8], "P": [6], "X": [7]}, "2.10": {"C": [1, 2, 3, 5, 7, 8, 11], "P": [4, 6, 9], "X": [10]}, "2.11": {"C": [1, 2, 4, 5, 6, 8], "P": [3], "X": [7]}},
};
